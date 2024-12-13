import * as React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Page404() {

  function checkTokenExpired () {
      axios.request({
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: "GET",
          url: `http://localhost:8082/users/jwt`
      }).then((responseAuth) => {
          if(responseAuth.token === null) {
            localStorage.clear();
            window.location.reload();
          }
      }).catch(function (error) {
          console.log(error.message);
          localStorage.clear();
          window.location.reload();
      });
  }

  useEffect(() => {
    checkTokenExpired();
  },[]);

  const { t } = useTranslation();

  return (
    <div>
      <div className='row alert alert-light p-0 mt-0'
        style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
        <ul className='nav nav-pills nav-fill' style={{minHeight:"35px"}}>
        </ul>
      </div>
      <div>
        <div className='p-2 text-center fs-2 fw-lighter alert alert-danger showMe'>
          {t('404PageTitle')}
        </div>
      </div>
    </div>
)}
