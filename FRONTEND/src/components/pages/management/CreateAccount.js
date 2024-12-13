import * as React from 'react';
import {useState} from 'react';
import axios from 'axios';
import * as Icon from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

export default function CreateAccount() {
  const [step1, setStep1] = useState("");
  const [step2, setStep2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cnp, setCnp] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [address, setAddress] = useState("");
  const [employmentDate, setEmploymentDate] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    let userData = {
      email: e.target.inputEmail.value,
      firstName: e.target.inputFirstName.value,
      lastName: e.target.inputLastName.value,
      password: e.target.inputPassword.value,
      role: e.target.inlineRadioOptions.value,
      birthdate: e.target.inputBirthdate.value,
      employmentDate: e.target.inputEmploymentDate.value,
      phoneNumber: e.target.inputPhoneNumber.value,
      cnp: e.target.inputCnp.value,
      jobTitle: e.target.inputJobTitle.value,
      address: e.target.inputAddress.value
    }
    let formIncomplete = false;
    for (var member in userData) {
      if (userData[member].replace(/ /g,'').length === 0) {
        formIncomplete = true;
      }
    }
    if(formIncomplete 
      || (step1 !== step2)
      || checkPasswordStrength(step1) !== 100
      || checkPasswordStrength(step2) !== 100) {
        alert(t('incompleteForm'));
    } else {
      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        data: userData,
        method: "POST",
        url: `http://localhost:8082/signup`
      }).then((response) => {
        alert(t('accountCreationSuccessAlert'))
        setFirstName("");
        setLastName("");
        setEmail("");
        setStep1("");
        setStep2("");
        setBirthdate("");
        setJobTitle("");
        setCnp("");
        setPhoneNumber("");
        setAddress("");
        setEmploymentDate("");
      }).catch(function (error) {
        alert(t('accountCreationFailAlert'))
        console.log(error.message);
        window.location.reload();
      });
    }
  }

  const checkPasswordStrength = (password) => {
    let strength = 0;
    let strengthbar = 0;
    if (password.match(/[a-z]+/)) {
      strength += 1;
    }
    if (password.match(/[A-Z]+/)) {
      strength += 1;
    }
    if (password.match(/[0-9]+/)) {
      strength += 1;
    }
    if (password.match(/[$@#&!]+/)) {
      strength += 1;
    }
  
    switch (strength) {
      case 0:
        strengthbar = 0;
        break;
      case 1:
        strengthbar = 25;
        break;
      case 2:
        strengthbar = 50;
        break;
      case 3:
        strengthbar = 75;
        break;
      case 4:
        strengthbar = 100;
        break;
      default: strengthbar = 0;
    }
    return strengthbar;
  }

  return (
    <div>
      <h3 className='fw-lighter'><Icon.PersonPlusFill size={24} style={{marginBottom:'4px'}}/> {t('newAccountTitle')}</h3><hr/>
      <h5 className='fw-light'>{t('newAccountDescription')}</h5>
      <div className='row'>
        <form className='p-3 col-12 col-sm-12 col-md-8' onSubmit={handleSubmit}>
          <div className='form-floating my-3'>
              <input type='text' className='form-control'
                placeholder=' 'name='inputLastName' autofocus
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}/>
              <label className='float-sm-left' htmlFor='inputLastName'> 
              {t('firstName')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='text' className='form-control' 
                placeholder=' 'name='inputFirstName'
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}/>
              <label className='float-sm-left' htmlFor='inputFirstName'> 
              {t('lastName')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='number' className='form-control'
                min="0"
                name='inputCnp' placeholder='CNP'
                onChange={(e) => setCnp(e.target.value)}
                value={cnp}/>
              <label className='float-sm-left' htmlFor='inputCnp'> 
              {t('cnp')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='number' className='form-control'
                min="0"
                name='inputPhoneNumber' placeholder='Telefon'
                onChange={(e) => setPhoneNumber(e.target.value)}
                value={phoneNumber}/>
              <label className='float-sm-left' htmlFor='inputPhoneNumber'> 
              {t('phoneNumber')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='text' className='form-control' 
                placeholder=' ' name='inputAddress'
                onChange={(e) => setAddress(e.target.value)}
                value={address}/>
              <label className='float-sm-left' htmlFor='inputAddress'> 
              {t('address')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='date' className='form-control'
                data-date-split-input="true"
                name='inputBirthdate'
                onChange={(e) => setBirthdate(e.target.value)}
                value={birthdate}/>
              <label className='float-sm-left' htmlFor='inputBirthdate'> 
              {t('birthdate')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='date' className='form-control'
                data-date-split-input="true"
                name='inputEmploymentDate'
                onChange={(e) => setEmploymentDate(e.target.value)}
                value={employmentDate}/>
              <label className='float-sm-left' htmlFor='inputEmploymentDate'> 
              {t('employmentDate')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='text' className='form-control'
                name='inputJobTitle' placeholder='Angajat'
                onChange={(e) => setJobTitle(e.target.value)}
                value={jobTitle}/>
              <label className='float-sm-left' htmlFor='inputJobTitle'> 
              {t('jobTitle')} </label>
          </div>
          <div className='form-floating my-3'>
              <input type='email' className='form-control'
                placeholder='lastName@exemplu.com' name='inputEmail'
                onChange={(e) => setEmail(e.target.value)}
                value={email}/>
              <label className='float-sm-left' htmlFor='inputEmail'> 
              {t('email')} </label>
              <small className='px-2'>{t('newAccountEmailDescription')}</small>
          </div>
          <div className='form-floating my-3'>
              <input type='password' className='form-control' 
                placeholder={t('passwordPlaceholder')} name='inputPassword'
                onChange={(e) => setStep1(e.target.value)}
                value={step1}/>
              <label htmlFor='inputPassword'> 
              {t('passwordPlaceholder')} </label>
          </div>
          <div className='form-floating my-3'>
            <input type='password' className='form-control' 
              placeholder={t('confirmPasswordPH')} name='inputPasswordConfirm'
              onChange={(e) => setStep2(e.target.value)}
              value={step2}/>
            <label htmlFor='inputPasswordConfirm'> 
            {t('confirmPasswordPH')} </label>
          </div>
          {step1!==step2 && <div class="alert alert-danger">
            {t('passwordConfirmationError')}
          </div>}
          {(step1.length <= 6
          || step2.length >= 15
          || checkPasswordStrength(step1)!==100 
          || checkPasswordStrength(step2)!==100)
          && (step1.length > 0 && step2.length > 0)
          && <div class="alert alert-danger">
            {t('passwordRequirement1')}:<br></br>
            {t('passwordRequirement2')} <br></br>
            {t('passwordRequirement3')} <br></br>
            {t('passwordRequirement4')}<br></br>
            {t('passwordRequirement5')}<br></br>
            {t('passwordRequirement6')}
          </div>}
          <div className='alert alert-white border rounded'>
            {t('role')}: <br></br>
            <div class="form-check form-check">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="USER"/>
              <label class="form-check-label" for="inlineRadio1">{t('userRoleActions')}</label>
            </div>
            <div class="form-check form-check">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="MANAGER"/>
              <label class="form-check-label" for="inlineRadio2">{t('managerRoleActions')}</label>
            </div>
            <div class="form-check form-check">
              <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" value="ADMIN"/>
              <label class="form-check-label" for="inlineRadio3">{t('administratorRoleActions')}</label>
            </div>
          </div>
          <div className='text-end mb-3'>
              <button className="btn btn-primary"
                  type="submit" id='loginButton'>{t('register')}</button>
          </div>
        </form>
        <div className='col-12 col-sm-12 col-md-4'>
          <div className='alert alert-light' style={{marginTop:"31px"}}>
            {t('userRoleDescription')}<br></br><br></br>
            <p className='fst-italic'>{t('userRoleActionsDescription')}:</p>
            <p className='fw-bold'>{t('userRoleActions')}:</p>
            <div class="list-group">
            <ul className='m-2'>
              <li>{t('userRoleActions2')}</li>
              <li>{t('userRoleActions3')}</li>
              <li>{t('userRoleActions4')}</li>
              <li>{t('userRoleActions5')}</li>
              <li>{t('userRoleActions6')}</li>
              <li>{t('userRoleActions7')}</li>
            </ul>
            </div><br></br>
            <p className='fw-bold'>{t('managerRoleActions')}:</p>
            <div class="list-group">
              <ul className='m-2'>
              <li>{t('userRoleActions2')}</li>
              <li>{t('userRoleActions3')}</li>
              <li>{t('userRoleActions4')}</li>
              <li>{t('userRoleActions5')}</li>
              <li>{t('userRoleActions6')}</li>
              <li>{t('userRoleActions7')}</li>
              <li>{t('userRoleActions8')}</li>
              <li>{t('userRoleActions9')}</li>
              <li>{t('userRoleActions10')}</li>
              <li>{t('userRoleActions11')}</li>
            </ul>
            </div><br></br>
            <p className='fw-bold'>{t('administratorRoleActions')}:</p>
            <div class="list-group">
            <ul className='m-2'>
            <li>{t('userRoleActions2')}</li>
              <li>{t('userRoleActions3')}</li>
              <li>{t('userRoleActions4')}</li>
              <li>{t('userRoleActions5')}</li>
              <li>{t('userRoleActions6')}</li>
              <li>{t('userRoleActions7')}</li>
              <li>{t('userRoleActions8')}</li>
              <li>{t('userRoleActions9')}</li>
              <li>{t('userRoleActions10')}</li>
              <li>{t('userRoleActions11')}</li>
              <li>{t('userRoleActions12')}</li>
            </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
