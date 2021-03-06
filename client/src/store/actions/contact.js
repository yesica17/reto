import * as creators from "../creators/contact";
import { GETData, SETData } from "../../services/WebServices";

export const setContact = (payload) => {
  return {
    type: creators.SET_CONTACT,
    payload,
  };
};

export const createContact = (payload) => {
  return async (dispatch, getState) => {
    const data = {
      users: { id: getState().login.user.id },
      state: payload.state,
      city: payload.city,
      adress: payload.adress,
    };    
    await SETData(`contact`, "POST", data)
      .then((response) => {
        if (response !== null) {         
          console.log(response)
        }
      })
      .catch((response) => console.error(response));
  };
};

export const loadContact = () => {    
  return async (dispatch, getState) => { 
    const data = {
        id: getState().login.user.id
    };    
    await SETData(`contact/load`, "POST", data)
      .then((response) => {
        if (response !== null) {         
          dispatch(setContact(response));
          console.log(response)
        }
      })
      .catch((response) => console.error(response));
  };
};

export const updateAmount = (payload) => {
  return async (dispatch, getState) => {
    const data = {      
      state_cart: true
    };    
    await SETData(`cart/amount/${payload}`, "PUT", data)
      .then((response) => {
        if (response !== null) {
          console.log(response);
        }
      })
      .catch((response) => console.error(response));
  };
};
