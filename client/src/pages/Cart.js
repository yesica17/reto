import {Add, Remove, Edit, WarningSharp, AssignmentLateSharp } from "@material-ui/icons";
import { Drawer} from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';

import Announcement from "../components/Announcement";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Contact from "./Contact";
import {  ContainerCart,  WrapperCart,  TitleCart,  TopCart,  TopButtonCart, BottomCart,InfoCart, ProductCart, ProductDetail, ImageCart, DetailsCart, ProductName, ProductId, ProductColor, ProductSize, PriceDetail, ProductAmountContainer,  ProductAmount, ProductPrice, HrCart, Summary, SummaryTitle, SummaryItem,  SummaryItemText, SummaryItemPrice, ButtonCart, EditButton,ImgContainerProd, InfoContainer, AmountContainer, Amount, ButtonProd} from "../components/Styled_components";

import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import * as cartActions from "../store/actions/cart";


const Cart = (props) => {       

  const [cart, setCart] = useState(null);
  const [open, setOpen] = useState(false);     
  const [quantity, setQuantity] = useState(1);
  const [openModal, setOpenModal] = useState(false);      
  const [state, setState] = useState(null);

  useEffect(() => {
    props.loadCart();  
    
  }, []);    
  
  const amount = props.cart.filter(value=>value.stocks.available_quantity!==0 && value.req_quantity<= value.stocks.available_quantity).map((value) => value.req_quantity * value.stocks.product.price)
        .reduce((a, b) => a + b, 0);
  
  const stateCart=props.cart.filter( value=>value.req_quantity > value.stocks.available_quantity);
 
  

  return (   
    <Fragment>
      {cart?      
      <Drawer 
        placement='right' size='xs' 
        onEnter={()=>{
          if (!(cart.req_quantity<cart.stocks.available_quantity)){            
            setQuantity(cart.stocks.available_quantity);                      
            setCart({...cart, req_quantity: cart.stocks.available_quantity});}
        }}
        show={open} 
        onHide={() => setOpen(false)}>
            <Drawer.Header>
                  <Drawer.Title>{cart.stocks.product.styles[0].name}{" "}
                                            {cart.stocks.product.brands[0].name}{" "}
                                            {cart.stocks.product.categories[0].name}
                  </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
                <ImgContainerProd>
                      <ImageCart src={cart.stocks.product.img} />
                </ImgContainerProd>
                <br/>
              <InfoContainer>
                {cart.stocks.available_quantity>0?(
                  <AmountContainer>
                      <Remove onClick={async() => {await quantity > 1 && 
                            setQuantity(quantity - 1);                      
                            setCart({...cart, req_quantity: quantity-1,}); }}/>

                      {cart.req_quantity<cart.stocks.available_quantity ?( 
                      <Amount>{quantity}</Amount>):<Amount>{
                          cart.stocks.available_quantity}</Amount>}
                      <Add onClick={async() => {
                            if (quantity < cart.stocks.available_quantity) {
                              await setQuantity(quantity + 1)};
                              setCart({
                                ...cart,
                                req_quantity: quantity+1, });
                            }} />
                  </AmountContainer>):null}            
                  <br/>
                  <ProductId>
                      <b>Cantidad disponible:</b> {cart.stocks.available_quantity}
                  </ProductId>
                  <br/><br/>
                  <ButtonProd onClick={async () => {
                        await props.updateCart(cart);
                        }}> Actualizar </ButtonProd>
              
              </InfoContainer>
        
            </Drawer.Body>
      </Drawer> : null}  
      
      <ContainerCart>
        <Navbar />
        <Announcement />
        {props.cart.length ? (
          <WrapperCart >
            <TitleCart>Carrito de Compras</TitleCart>
            <TopCart>
              <Link to="/">
                <TopButtonCart>Continuar Comprando</TopButtonCart>
              </Link>
              <TopButtonCart type="filled">COMPRAR AHORA</TopButtonCart>
            </TopCart>
            <BottomCart>              
                  <InfoCart>
                      { props.cart.map((value) =>                     
                          <ProductCart >
                              <ProductDetail>                              
                                  <ImageCart src={value.stocks.product.img} />
                                  <DetailsCart>
                                      <ProductName>
                                          <b>Producto:</b>{" "}
                                          {value.stocks.product.styles[0].name}{" "}
                                          {value.stocks.product.brands[0].name}{" "}
                                          {value.stocks.product.categories[0].name}
                                      </ProductName>
                                      <ProductId>
                                          <b>ID:</b> {value.stocks.product.id}
                                      </ProductId>
                                      <ProductColor color={value.stocks.color.color} />
                                      <ProductSize>
                                          <b>Talla:</b> {value.stocks.size.size}
                                      </ProductSize>
                                      <TopButtonCart onClick={async () => {
                                            await props.deleteCart(value.id);
                                            await props.loadCart();
                                          }}>Eliminar producto
                                      </TopButtonCart>
                                  </DetailsCart>
                                  </ProductDetail>
                                      {value.req_quantity<= value.stocks.available_quantity ?(<PriceDetail>                                 
                                          <ProductAmountContainer>                  
                                              <ProductAmount> <b>Cantidad: 
                                                {value.req_quantity}</b>
                                              </ProductAmount><br/>
                                              <EditButton onClick={()=>{
                                                    setCart(value);
                                                    setQuantity(value.req_quantity)
                                                    setOpen(true);
                                                    }}>Cambiar{" "}<Edit style={{ fontSize: 16 }} ></Edit>
                                                    </EditButton>
                                            </ProductAmountContainer>             
                                            <ProductPrice> <b>Precio por unidad: 
                                                  $ {(value.stocks.product.price/ 1000).toFixed(3)}{" "}</b>
                                            </ProductPrice>
                                            <ProductPrice> <b>Subtotal: 
                                                  $ {(value.req_quantity*value.stocks.product.price/ 1000).toFixed(3)}{" "}</b>
                                              </ProductPrice>
                                        </PriceDetail>):
                                        <PriceDetail>                                 
                                          {value.stocks.available_quantity!==0 ?(
                                            <ProductAmountContainer>                   
                                                <ProductAmount style={{ color: "gainsboro" }} >Cantidad: {value.req_quantity}
                                                <EditButton onClick={()=>{
                                                      setCart(value);
                                                      setQuantity(value.req_quantity)
                                                      setOpen(true);
                                                      }}>Cambiar{" "}
                                                  <Edit style={{fontSize: 16 }} ></Edit>
                                                </EditButton>
                                                </ProductAmount>
                                              </ProductAmountContainer>): 
                                                  <ProductAmount style={{fontSize: 25, fontWeight: "bold" }} ><AssignmentLateSharp style={{color: "black", fontSize: 20}} /> Agotado  
                                                  </ProductAmount>}
                                                  <ProductAmount>La cantidad requerida ya no se encuentra disponible. Actualice la cantidad solicitada o descarte este producto.  <WarningSharp style={{color: "gold", fontSize: 18 }} /> </ProductAmount>                       
                                        </PriceDetail>}
                            </ProductCart>)}
                    <HrCart/>       
                  </InfoCart>
           
            <Summary>
              <SummaryTitle>RESUMEN ORDEN</SummaryTitle>

              <SummaryItem type="total">
                <SummaryItemText>Total</SummaryItemText>

                <SummaryItemPrice>
                  $ {(amount / 1000).toFixed(3)}
                </SummaryItemPrice>
              </SummaryItem>
              
                <ButtonCart onClick={async()=>{setOpenModal(true);                    
                    await stateCart.map(value=>setState(value));
                    console.log("estado",state);        
                    if(state){setState({...state, state_cart: false});
                    console.log(state);
                    await props.updateCart(state);
                   }}}>COMPRAR AHORA
                </ButtonCart>
              
            </Summary>
            </BottomCart>
          </WrapperCart>
        ) : null}
        <Footer />
      </ContainerCart>
       
      <Contact open={openModal} setOpen={setOpenModal}></Contact>
    </Fragment>
      
  );
};

//leer estados
const mapStateToProps = (state) => ({
  cart: state.cart.cart,
   
});

//ejecutar acciones
const mapDispatchToProps = (dispatch) => ({
  loadCart: () => dispatch(cartActions.loadCart()), 
  deleteCart: (payload) => dispatch(cartActions.deleteCart(payload)),  
  updateCart: (payload) => dispatch(cartActions.updateCart(payload)),  
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);