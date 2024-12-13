import * as React from 'react';
import LoginForm from './LoginForm'
import Viewer from './Viewer'
import { useState, useEffect } from 'react';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { useTranslation } from 'react-i18next';

export default function Main() {  
    const [loggedIn, setLoggedIn] = useState(false);
    const { t, i18n } = useTranslation();

    function checkLoggedIn() {
        const token = localStorage.getItem('token')
        if( token && token.length !== 0){
            setLoggedIn(true)
        } else {
            setLoggedIn(false)
        }
    }

    window.addEventListener('storage', () => {
        checkLoggedIn()
    })

    useEffect(() => {
        i18n.changeLanguage(localStorage.getItem("language"));
        checkLoggedIn()
        window.addEventListener('storage', checkLoggedIn);
        return (() => {
            window.removeEventListener('storage', checkLoggedIn);
        })
    },[])

    return (
        <div style={{height:"100vh"}}>
            <div className='container-fluid'>
                <div>       
                    {!loggedIn && <LoginForm/> }
                    {loggedIn && <Viewer/>}
                </div>
            </div>
            <footer className='text-center p-2 m-5 text-body-tertiary'>
                <div style={{height:"150px"}} >
                <hr/>
                    <small>{t('footer')}</small>
                </div>
            </footer>
        </div>
    )
}
