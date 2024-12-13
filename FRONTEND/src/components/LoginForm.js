import * as React from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import LanguageSelector from '../localization/LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function LoginForm() {
    const { t, i18n } = useTranslation();

    function handleChange (e) {
        e.preventDefault();
        const userData = {
            email: e.target.inputEmail.value,
            password: e.target.inputPassword.value
        }
        if (!userData.email || !userData.password) {
            alert(t('loginFormIncomplete!'));
            return;
        }
        axios.post('http://localhost:8082/signin', userData
        ).then((response) => {
            localStorage.setItem("token", response.data.token);
            window.dispatchEvent(new Event("storage"));
        }).catch(function (error) {
            alert(t('loginFormIncorrect'));
        });
    }

    useEffect(() => {
        i18n.changeLanguage(localStorage.getItem("language"));
    }, [])

    return (
        <div className='container'>
            <div className='jumbotron jumbotron-fluid text-start'>
                <h1 className='display-4 px-3 border fw-normal animatedGradient text-white'>hrm</h1>
                <div className='lead text-start px-3 text-secondary-emphasis'>{t('loginTitleSecondary')}</div>
            </div>
            <LanguageSelector darkmode/>
            <div className='card-body border p-3 m-5 mx-auto'
                style={{maxWidth:"400px"}}>
                <form className='p-3 mx-auto' onSubmit={handleChange}>
                    <div className='form-floating my-3'>
                        <input type='email' className='form-control' autoFocus
                            placeholder='nume@example.com' name='inputEmail'/>
                        <label className='float-sm-left' htmlFor='inputEmail'> {t('emailAddressPlaceholder')} </label>
                    </div>
                    <div className='form-floating my-3'>
                        <input type='password' className='form-control' 
                                placeholder={t('passwordPlaceholder')} name='inputPassword'/>
                            <label htmlFor='inputEmail'> {t('passwordPlaceholder')} </label>
                    </div>
                    <div className='text-end mb-3'>
                        <button className="btn btn-primary"
                            type="submit" id='connectButton'>{t('signInButton')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}