import * as express from "express";
import { User } from "../models/User";
import { Document } from "../models/Documents";

import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "../controllers/token";

/**
 *  @swagger
 *  components:
 *      schemas:
 *          User:
 *              type: object
 *              properties:
 *                  name:
 *                      type: string
 *                      description: the user name
 *              required:
 *                - name
 *              
 */

class UserController {
  public path = "/user";
  public router: express.Router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // UserController middleware
    this.router.use(this.validateInput);

    // Controller endpoints
    this.router.post(this.path + "/login", this.login);
    this.router.post(this.path, this.createUser);
    this.router.get(this.path, this.getAllUsers);
    this.router.get(this.path + "/document", this.getAllDocument);
    this.router.get(this.path + "/:id", this.getUser);

    this.router.put(this.path + "/:id", this.updateUser);

    this.router.delete(this.path + "/:id", this.deleteUser);
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

  //-----------------------Login--------------------------

  public async login(req: express.Request, res: express.Response) {
    try {
      const loginData = req.body;
      const user = await User.findOne({
        email: loginData.email,
      });
      !user && res.send(true);
      const isPasswordMatching = await bcrypt.compare(
        loginData.password,
        user.password
      );
      !isPasswordMatching && res.send(false);

      const accessToken = jwt.sign(
        {
          user: {
            id: user.id,
            isAdmin: user.isAdmin,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
          }
        },
        process.env.JWT_SEC,
        { expiresIn: "15d" }
      );
      user.token=accessToken;
      
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  }
  /**
   * @swagger
   * /user:
   *    post:
   *        summary: create a new user
   * 
   */
  //------------Create User-----------------
  public async createUser(req: express.Request, res: express.Response) {
    const userData = req.body;
    const user = new User();
    const document = new Document();

    if (await User.findOne({ email: userData.email })) {
      return res.status(200).send("Username is already taken");
    } else {
      user.document = userData.document;
      user.name = userData.name;
      user.lastname = userData.lastname;
      user.email = userData.email;
      user.password = await bcrypt.hash(userData.password, 10);
      document.id = userData.type_document.id;
      user.type_document = document;

      //contact.users = user;
    }

    try {
      const savedUser = await user.save();
      res.status(200).json(savedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  //--------Get all users--------------
  public async getAllUsers(req: express.Request, res: express.Response) {
    const clients = await User.find();
    return res.send(clients);
  }

  //--------Get all documents--------------
  public async getAllDocument(req: express.Request, res: express.Response) {
    const documents = await Document.find();
    return res.send(documents);
  }

  //---------------Get user---------------
  public async getUser(req: express.Request, res: express.Response) {
    const client = await User.findOne(req.params.id);
    return res.send(client);
  }

  //------------------Update user------------------
  public async updateUser(req: express.Request, res: express.Response) {
    const user = await User.findOne(req.params.id);
    if (user !== undefined) {
      await User.update(req.params.id, req.body);
      return res.status(200).send({ message: "User updated correctly" });
    }

    return res.status(404).send({ message: "User not found" });
  }

  //-------------------Delete user---------------------
  public async deleteUser(req: express.Request, res: express.Response) {
    User.delete(req.params.id);
    return res.status(200).send({ message: "User deleted successfully" });
  }
}
export default UserController;
