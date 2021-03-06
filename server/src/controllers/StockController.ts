import * as express from "express";
import { Stock } from "../models/Stock";
import { Size } from "../models/Sizes";
import { Color } from "../models/Colors";
import { Product } from "../models/Products";
import { StockDto } from "../dto/stockDto";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "../controllers/token";

class StockController {
  public path = "/stock";
  public router: express.Router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // UserController middleware
    this.router.use(this.validateInput);

    // Controller endpoints
    this.router.post(this.path, this.createStock);
    this.router.get(this.path + "/load", this.getStockDto);
    this.router.get(this.path + "/size", this.getAllSize);
    this.router.get(this.path + "/color", this.getAllColor);
    this.router.get(this.path + "/:id", this.getStock);
    

    this.router.put(this.path + "/:id", this.updateStock);

    this.router.delete(this.path + "/:id", this.deleteStock);
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

  //------------Create Stock-----------------
  public async createStock(req: express.Request, res: express.Response) {
    const stockData = req.body;
    const stock = new Stock();
    stock.available_quantity = stockData.available_quantity;
    const size = await Size.findOne(stockData.size.id);
    stock.size = size;
    const color = await Color.findOne(stockData.color.id);
    stock.color = color;
    const product = await Product.findOne(stockData.product.id);
    stock.product = product;
    
    const findStock = await Stock.find({where: [{colorId: stockData.color.id, sizeId: stockData.size.id, productId: stockData.product.id}]});  

    console.log(findStock.length)

    try {
        if (findStock.length === 1){ res.send(true)}else{
            const savedStock = await    stock.save();
            res.status(200).json(savedStock);
           }    
    } catch (err) {
      res.status(500).json(err);
    }
  }

  //--------DTO Stock--------------
  public async getStockDto(req: express.Request, res: express.Response) {       
    const stock = await Stock.find({     
      relations: ["product"],  
      where: [
        { status_stock: true },
      ],    
      order:{ id: "DESC" }        
    });      

    const dtoStock: StockDto[] = stock.map( s => {
        return {
        id_product: s.product.id,        
        id_stock: s.id,
        available_quantity: s.available_quantity,
        id_color: s.colorId,
        color: s.color.color,
        color_spa: s.color.color_spa,
        id_size: s.sizeId,
        size: s.size.size,
        }
        });
        
        return res.send(dtoStock);    
  } 

  //--------Get all size--------------
  public async getAllSize(req: express.Request, res: express.Response) {
    const sizes = await Size.find();
    return res.send(sizes);
  }

  //--------Get all color--------------
  public async getAllColor(req: express.Request, res: express.Response) {
    const colors = await Color.find({order:{color_spa: "ASC"}   });
    return res.send(colors);
  }

  //---------------Get stock---------------
  public async getStock(req: express.Request, res: express.Response) {
    const stock = await Stock.findOne(req.params.id);
    return res.send(stock);
  }

  //------------------Update stock------------------
  public async updateStock(req: express.Request, res: express.Response) {
    const stock = await Stock.findOne(req.params.id);
    if (stock !== undefined) {
      await Stock.update(req.params.id, req.body);
      return res.status(200).send({ message: "Stock updated correctly" });
    }

    return res.status(404).send({ message: "Stock not found" });
  }

  //-------------------Delete product---------------------
  public async deleteStock(req: express.Request, res: express.Response) {
    Stock.delete(req.params.id);
    return res.status(200).send({ message: "Stock deleted successfully" });
  }
}

export default StockController;
