import * as express from "express";
import { Product } from "../models/Products";
import { Category } from "../models/Categories";
import { Style } from "../models/Styles";
import { Brand } from "../models/Brands";
import { ProductsDto } from "../dto/productsDto";
import {getRepository} from "typeorm";
import { Stock } from "../models/Stock";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "../controllers/token";
import { createSecureContext } from "tls";
import { hasUncaughtExceptionCaptureCallback } from "process";

class ProductController {
  public path = "/product";
  public router: express.Router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // UserController middleware
    this.router.use(this.validateInput);

    // Controller endpoints
    this.router.post(this.path, this.createProduct);
    this.router.get(this.path, this.getAllProduct);
    this.router.get(this.path + "/dto", this.getProductDto);    
    this.router.get(this.path + "/dtoAdmin", this.getProductDtoAdmin);  
    this.router.get(this.path + "/category", this.getAllCategory);
    this.router.get(this.path + "/style", this.getAllStyle);
    this.router.get(this.path + "/brand", this.getAllBrand );
    this.router.get(this.path + "/:id", this.getProduct);
    this.router.put(this.path + "/:id", this.updateProduct);        
    this.router.delete(this.path + "/:id", this.deleteProduct);
  }

  public validateInput(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const params = { id: req.url.split("/")[2] };
    switch (req.method) {
      case "GET":
        break;
      case "DELETE":
        if (!params.id) {
          return res.status(400).send({ message: "Id is required" });
        }
        break;
      case "POST":
        if (Object.keys(req.body).length === 0) {
          return res
            .status(400)
            .send({ message: "Request body can't be empty" });
        }
        break;
      case "PUT":
        if (!params.id) {
          return res.status(400).send({ message: "Id is required" });
        }
        if (Object.keys(req.body).length === 0) {
          return res
            .status(400)
            .send({ message: "Request body can't be empty" });
        }
        break;
    }
    next();
  }

  //------------Create Product-----------------
  public async createProduct(req: express.Request, res: express.Response) {
    const productData = req.body;
    const product = new Product();
    product.desc = productData.desc;
    product.img = productData.img;
    product.price = productData.price;
    const categories = await Category.findByIds(
      productData.categories.map((value) => value.id)
    );
    product.categories = categories;
    const styles = await Style.findByIds(
      productData.styles.map((value) => value.id)
    );
    product.styles = styles;
    const brands = await Brand.findByIds(
      productData.brands.map((value) => value.id)
    );
    product.brands = brands;

    try {
      const savedProduct = await product.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  //--------Get all products--------------
  public async getAllProduct(req: express.Request, res: express.Response) {       
    const products = await Product.find({
      relations: ["stock"],  
      order:{views: "DESC"}    
    });    
    return res.send(products);
  }

    //--------DTO Products Client--------------
  public async getProductDto(req: express.Request, res: express.Response) {   

    const product = await getRepository(Product)
    .createQueryBuilder("product")  
    .leftJoinAndSelect("product.stock", "stock")  
    .leftJoinAndSelect("product.categories", "categories")  
    .leftJoinAndSelect("product.styles", "styles")  
    .leftJoinAndSelect("product.brands", "brands")  
    .leftJoinAndSelect("stock.color", "color")  
    .leftJoinAndSelect("stock.size", "size")  
    .where("product.status_product= :status", { status: true })     
    .andWhere("stock.status_stock = :status", { status: true }) 
    .orderBy('product.views', 'DESC')
    .getMany();    
 
    // const products = await Product.find({     
    //     relations: ["stock"],   
    //     where: [
    //     { status_product: true},
    //   ],
    // //   where: (qb) => {        
    // //   qb.where(' stock.stock_status = : status',{status});
    // // },
    //   order:{views: "DESC"}    
    // });      

    const dtos: ProductsDto[] = product.map( p => {
        return {
        id_product: p.id,
        desc: p.desc,
        img: p.img,
        price: p.price,
        id_cat: p.categories.map(c=>c.id),
        category: p.categories.map(c=>c.name.toLowerCase()),
        id_brand: p.brands.map(b=>b.id),
        brand: p.brands.map(b=>b.name.toLowerCase()),
        id_style: p.styles.map(s=>s.id),
        style: p.styles.map(s=>s.name.toLowerCase()),
        id_stock: p.stock.map(i=>i.id),
        available_quantity: p.stock.map(q=>q.available_quantity),
        id_color: p.stock.map(c=>c.colorId),
        color: p.stock.map(c=>c.color.color.toLowerCase()),
        color_spa: p.stock.map(c=>c.color.color_spa.toLowerCase()),
        id_size: p.stock.map(s=>s.sizeId),
        size: p.stock.map(s=>s.size.size.toLowerCase())
        }
        });
        return res.send(dtos);    
  } 

  //--------DTO Products Admin--------------
  public async getProductDtoAdmin(req: express.Request, res: express.Response) {   
    
    const products = await Product.find({     
      relations: ["stock"],         
      order:{id: "DESC"}    
    });      

    const dtos: ProductsDto[] = products.map( p => {
        return {
        id_product: p.id,
        desc: p.desc,
        img: p.img,
        price: p.price,
        id_cat: p.categories.map(c=>c.id),
        category: p.categories.map(c=>c.name.toLowerCase()),
        id_brand: p.brands.map(b=>b.id),
        brand: p.brands.map(b=>b.name.toLowerCase()),
        id_style: p.styles.map(s=>s.id),
        style: p.styles.map(s=>s.name.toLowerCase()),
        id_stock: p.stock.map(i=>i.id),
        available_quantity: p.stock.map(q=>q.available_quantity),
        id_color: p.stock.map(c=>c.colorId),
        color: p.stock.map(c=>c.color.color.toLowerCase()),
        color_spa: p.stock.map(c=>c.color.color_spa.toLowerCase()),
        id_size: p.stock.map(s=>s.sizeId),
        size: p.stock.map(s=>s.size.size.toLowerCase())
        }
        });
        return res.send(dtos);    
  } 


  //--------Get all category--------------
  public async getAllCategory(req: express.Request, res: express.Response) {
    const categorys = await Category.find();   
    
    return res.send(categorys);
    
    
  }

  //--------Get all style--------------
  public async getAllStyle(req: express.Request, res: express.Response) {
    const styles = await Style.find({order:{name: "ASC"}   });
    return res.send(styles);
  }

  //--------Get all brand--------------
  public async getAllBrand(req: express.Request, res: express.Response) {
    const brands = await Brand.find({order:{name: "ASC"}   });    
    return res.send(brands);
  }

  //---------------Get product---------------
  public async getProduct(req: express.Request, res: express.Response) {
    
    const client = await Product.findOne(req.params.id, {
      relations: ["stock"],
    });
    return res.send(client);
  } 

  //------------------Update product------------------

  public async updateProduct(req: express.Request, res: express.Response) {
    const productRepository = getRepository(Product);
    let product = await Product.findOne(req.params.id);
    req.body.id= req.params.id;
    product.categories =req.body.categories;
    product.desc =req.body.desc;
    product.img =req.body.img;
    product.styles =req.body.styles;
    product.brands =req.body.brands;
    product.views =req.body.views;
    product.status_product = req.body.status_product;
    //console.log(req.body)
    if (product !== undefined) {
      await productRepository.save(product);
      return res.status(200).send({ message: "Product updated correctly" });
    }
    return res.status(404).send({ message: "Product not found" });
  }

  

  //-------------------Delete product---------------------
  public async deleteProduct(req: express.Request, res: express.Response) {
    Product.delete(req.params.id);
    return res.status(200).send({ message: "Product deleted successfully" });
  }



}

export default ProductController;
