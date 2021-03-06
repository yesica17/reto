import { ContainerLogin, WrapperLogin, TitleLogin, FormLogin, ButtonLogin, LinkLogin } from "./style";
import Navbar from "../../components/navbar/Navbar";
import { Input} from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';

import { connect } from "react-redux";
import * as loginActions from "../../store/actions/login";

import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Register from "../register/Register";

const Login = (props) => {
        

        const userInit = {
            email: "",
            password: "",
        };
        const [user, setUser] = useState(userInit);
        const history=useHistory();
        const [open, setOpen] = useState(false);    

        useEffect(() => {            
            if(props.user){
                history.push("/")
            }         
        }, [props.user]);   
        
        return (
            <div>
                <Navbar/>
                <ContainerLogin>      
                    <WrapperLogin>
                        <TitleLogin>Iniciar Sesión</TitleLogin>
                        <FormLogin>
                            <div style={{marginTop: 5, width: 250}}>
                            <Input placeholder="email" onChange={(value) => setUser({ ...user, email: value })}/>
                            </div>
                            <div style={{marginTop: 5, width: 250}}>
                            <Input type="password" placeholder="password"  onChange={(value) =>  setUser({ ...user, password: value })}/>
                            </div>                        
                            <ButtonLogin onClick={async () => {
                                    await props.loginUser(user);                                                 
                            }}> INGRESAR </ButtonLogin>  
                            <h5>¿No tienes una cuenta?</h5>      
                            <LinkLogin onClick={()=>{setOpen(true)}}>CREAR UNA CUENTA NUEVA</LinkLogin>                        
                        </FormLogin>
                    </WrapperLogin>
                </ContainerLogin>
                <Register open={open} setOpen={setOpen}></Register>
            </div>
        );
};

//leer estados
const mapStateToProps = (state) => ({
  user: state.login.user,
});

//ejecutar acciones
const mapDispatchToProps = (dispatch) => ({
  loginUser: (payload) => dispatch(loginActions.loginUser(payload)),  
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
