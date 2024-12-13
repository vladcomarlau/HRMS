import * as React from 'react';
import Button from 'react-bootstrap/Button';
import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Avatar from './Avatar';
import axios from 'axios';
import SearchBar from '../../search/SearchBar';
import * as Icon from 'react-bootstrap-icons';
import ProfileCard from '../organization/ProfileCard';
import Colleagues from './Colleagues';
import { useTranslation } from 'react-i18next';

export default function Profile(props) {
  // PROPS
  // notMe = id
  // search = true
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditTelModal, setShowEditTelModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [avatars] = useState(new Map());
  const [currentUserManager, setCurrentUserManager] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [subordinatesElements, setSubordinatesElements] = useState(null);

  const { t } = useTranslation();

  const handleShowUploadModal = () => {
    setShowUploadModal(true);
  }
  function logout() {
    localStorage.clear();
    window.location.reload();
}

  const handleCloseUploadModal = () => setShowUploadModal(false);

  const handleUpload = () => {
    let data = new FormData();
    data.append("filename", data);
    data.append('file', image);
    axios.post("http://localhost:8082/avatars", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "content-type": "multipart/form-data"
      }
    })
    .then((response) => {
      window.dispatchEvent(new Event("refreshAvatar"));
      setShowUploadModal(false);
    })
    .catch((e) => {
      console.log(e.message);
    });
  };
  
  const handleCloseEditTelModal = () => setShowEditTelModal(false);

  const handleModifyTel = () => {
    if(phoneNumber.length > 0 && Number(phoneNumber) > 0) {
      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        data: {
          phoneNumber: phoneNumber
        },
        method: "PUT",
        url: `http://localhost:8082/users/${currentUser.id}`
      }).then((response) => {
        setShowEditTelModal(false);
        if(response.data !== null) {
          alert(t('phoneNumberUpdated'));
          window.dispatchEvent(new Event("refreshProfile"));
        }
      }).catch(function (error) {
        console.log(error.message);
        window.location.reload();
      });
    } else {
      alert(t('phoneNumberRequired'))
      setPhoneNumber("")
    }
  }

  const handleCloseEditAddressModal = () => setShowEditAddressModal(false);

  const handleModifyAdress = () => {
    if(address.length > 0) {
      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        data:{
          address: address
        },
        method: "PUT",
        url: `http://localhost:8082/users/${currentUser.id}`
      }).then((response) => {
        setShowEditAddressModal(false);
        if(response.data !== null) {
          alert(t('addressUpdated'));
          window.dispatchEvent(new Event("refreshProfile"));
        }
      }).catch(function (error) {
        console.log(error.message);
        window.location.reload();
      });
    } else {
      alert(t('addressRequired'));
      setAddress("");
    }
  }

  const getCurrentUser = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/users/jwt`
    }).then((responseAuth) => {
        setCurrentUser(responseAuth.data);
        if(responseAuth.data != null) {
          setPhoneNumber(responseAuth.data.phoneNumber);
          setAddress(responseAuth.data.address);
          if(responseAuth.data.manager != null) {
            setCurrentUserManager(responseAuth.data.manager)
          }
        }
    }).catch(function (error) {
        console.log(error.message)
    });
  }

  const fetchUser = (id) => {
    axios.request({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        method: "GET",
        url: `http://localhost:8082/users/${id}`
    }).then((responseAuth) => {
    if(responseAuth.data != null) {
      setCurrentUser(responseAuth.data);
        if(responseAuth.data != null) {
          setPhoneNumber(responseAuth.data.phoneNumber);
          setAddress(responseAuth.data.address);
          if(responseAuth.data.manager != null) {
            setCurrentUserManager(responseAuth.data.manager)
          }
        }
    }
    }).catch((error) => {
        console.log(error.message);
    })
}
  
  useEffect( () => {
    if ( props.notMe ) {
      fetchUser(props.notMe);
      window.addEventListener('refreshProfile', fetchUser(props.notMe));
    } else {
      getCurrentUser();
      window.addEventListener('refreshProfile', getCurrentUser);
    }
    
    return( () => {
      window.removeEventListener('refreshProfile', fetchUser(props.notMe));
      window.removeEventListener('refreshProfile', getCurrentUser);
    })
  },[])

  useEffect( () => {
    if(currentUser != null) {
      if (currentUser.manager != null
      && currentUser.manager.avatar != null) {
        fetchAvatar(currentUser.manager.id, currentUser.manager.avatar.id);
      }
    }
  },[currentUser])

  useEffect( () => {
    if(currentUserManager != null) {
      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        method: "GET",
        url: `http://localhost:8082/users/${currentUserManager.id}/hierarchy`
      }).then((response) => {
        if(response.data != null) {
          let subordinatesElementsTemp = 
            response.data.subordinates.reduce(function (rows, key, index) { 
                return (index % 2 == 0 ? rows.push([key]) 
                : rows[rows.length-1].push(key)) && rows;
            }, []).map((e)=>
            (e != null) && (
                <div className='row m-0 p-0'>

                    {e[0] != null && (
                    <div className='col-6 border-bottom border-end p-1'>
                        <ProfileCard id={e[0].id} count = {e[0].subordinatesCount}/>
                    </div>)}

                    {e[1] != null && (
                    <div className='col-6 border-bottom p-1'>
                        <ProfileCard id={e[1].id} count = {e[1].subordinatesCount}/>
                    </div>)}

                </div>
            ));
            setSubordinatesElements(subordinatesElementsTemp);
        }
      }).catch(function (error) {
        console.log(error.message);
        window.location.reload();
      });
    }
  },[currentUserManager])

  const fetchAvatar = (userId, avatarId) => {
    axios.get("http://localhost:8082/avatars/"+avatarId, {
      responseType: 'arraybuffer',
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    }).then((response) => {
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),''));
      avatars.set(userId, `data:;base64,${base64}`);
      setUpdated(!updated);
    }).catch(function (error) {
      console.log(error.message);
    });
  }

  let profile;
  let jobTitle;
  let seniorityComponent;

  if (currentUser != null && currentUser.email.length > 0) {
     jobTitle= (
      <div>
        <div className='m-2'>
          <div className='fw-bold'>
            {currentUser.firstName} {currentUser.lastName}<br></br>
          </div>
          <small className='fw-light'>{currentUser.jobTitle}</small><br></br>
        </div>
      </div>
    )
    profile = (
      <>
        <ul className='text-start m-3 list-group'>
          <li className='list-group-item'>{t('phoneNumber')}: {currentUser.phoneNumber}
            {!props.notMe && (<button className='btn btn-outline-dark btn-sm float-end'
              onClick={(e) => setShowEditTelModal(true)}>{t('modify')}</button>)}
          </li>
          {!props.notMe && ( <li className='list-group-item'>{t('address')}: {currentUser.address}
            <button className='btn btn-outline-dark btn-sm float-end'
              onClick={(e) => setShowEditAddressModal(true)}>{t('modify')}</button>
          </li>)}
          {!props.notMe && (<li className='list-group-item text-muted'>{t('cnp')}: {currentUser.cnp}</li>)}
          {!props.notMe && (<li className='list-group-item text-muted'>{t('birthdate')}: {currentUser.birthdate}</li>)}
        </ul>
        <ul className='text-start m-3 list-group'>
          <li className='list-group-item text-muted'>{t('email')}: {currentUser.email}</li>
          <li className='list-group-item text-muted'>{t('hrmid')}: {currentUser.id}</li>
          <li className='list-group-item text-muted'>{t('permissions')}: {currentUser.role}</li>
        </ul>
      </>
    )

    function seniority (employmentDate) {
      const dateOne = new Date(employmentDate);
      const dateTwo = new Date(); 

      const monthDiff = Math.abs(dateOne.getMonth() - dateTwo.getMonth() +
      (12 * (dateOne.getFullYear() - dateTwo.getFullYear())));
      return([Math.floor(monthDiff/12),
        monthDiff - 12 * Math.floor(monthDiff/12)])
    }

    seniorityComponent = (
      <div className='text-center m-3'>
        <h5 className='m-0'>
          <span className="badge text-bg-primary">
            {seniority(currentUser.employmentDate)[0]} {t('profileSeniority1')} {seniority(currentUser.employmentDate)[1]} {t('profileSeniority2')}
          </span>
        </h5>
        {t('profileEmployedSince')}:<br></br> {currentUser.employmentDate}
      </div>
    )
  } else {
    profile = (<></>);
    jobTitle = (<></>);
  }

  return (
    <div>
      {!props.notMe && (<div className='row alert alert-light p-0 mt-0'
          style={{borderRadius:"0px 0px 0px 0px", marginLeft:"-12px" , borderTop:"none"}}>
          <ul className='nav nav-pills nav-fill'>
            {<SearchBar/>}
            <span className={'m-1 btn btn-sm btn-outline-white'}
              onClick={logout}>{t('logout')}</span>
          </ul>
      </div>)}
    
      {currentUser !== null ? (
        <div className='row p-2'>
        {!props.notMe && (
        <div>
          <h3 className='fw-lighter'><Icon.PersonLinesFill size={24} style={{marginBottom:'4px'}}/> {t('profileTitle')}</h3><hr/>
        </div>)}
        <div className='p-2 col-12 col-sm-12 col-md-4 '>
          <div className=' text-center alert alert-light '>
            <div className='btn rounded-circle' 
              style={{border:"none"}}
              onClick={handleShowUploadModal}>
                <div className='d-flex justify-content-center'>
                  {currentUser != null && (<Avatar size={"150px"} id={currentUser.id}/>)}
                </div>
                {currentUser != null && jobTitle}
            </div>
          </div>

          <div className='text-center alert alert-light'>
            <div>
              <h5 className='fw-light'>{t('profileSeniorityTitle')}</h5>
              {currentUser != null && seniorityComponent}
            </div>
          </div>

          <div className='text-center alert alert-light'>
            <h5 className='fw-light'>{t('profileManagerTitle')}</h5>
            {(currentUser != null) && (currentUser.manager != null) ? 
              (<ProfileCard id={currentUser.manager.id}/>) :
              (<div className='text-muted p-2'>{t('organizationNoManager')}</div>)}
          </div>
        </div>

        <div className='p-2 col-12 col-sm-12 col-md-8'>
          <div className='text-center alert alert-light'>
            <div>
              <h4 className='fw-light'>{t('profileInfoTitle')}</h4>
              {currentUser != null && profile}
            </div>
          </div>
          <div className='text-center alert alert-light'>
            <div>
              <h4 className='fw-light'>{t('profileColleaguesTitle')}</h4>
              {(currentUser != null 
                && currentUser.manager != null
                  && (<Colleagues currentUser={currentUser} managerId={currentUser.manager.id}/>))}
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className='alert alert-danger text-center fw-lighter fs-3'>
          {t('userInexistent')}
        </div>
      )}

      <Modal show={showUploadModal} onHide={handleCloseUploadModal}>
        <Modal.Header closeButton>
          {props.search ? (<Modal.Title>{t('profileImageTitle1')}</Modal.Title>)
          : <Modal.Title>{t('profileImageTitle2')}</Modal.Title>}
        </Modal.Header>
        <Modal.Body >
            <div>
              <div class="mb-3 text-center" >
                <div className='d-flex justify-content-center'>
                  {currentUser != null && (<Avatar size={"350px"} id={currentUser.id}/>)}
                </div>
                {!props.notMe && (<div>
                  <label for="formFile" class="form-label"/>
                  <input class="form-control" type="file" id="formFile" accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}/>
                </div>)}
              </div>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUploadModal}>{t('close')}</Button>
          {!props.search && (
            <Button variant="primary" onClick={handleUpload}>{t('upload')}</Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showEditTelModal} onHide={handleCloseEditTelModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('profileModifyPhoneNumberTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body >
            <div>
              <div class="mb-3">
              <div className='form-floating my-3'>
                  <input type='number' className='form-control'
                    min="0"
                    name='inputPhoneNumber' placeholder={t('phoneNumber')}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    value={phoneNumber}/>
                  <label className='float-sm-left' htmlFor='inputPhoneNumber'> 
                  {t('phoneNumber')} </label>
                </div>
              </div>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditTelModal}>{t('close')}</Button>
          <Button variant="primary" onClick={handleModifyTel}>{t('modify')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditAddressModal} onHide={handleCloseEditAddressModal}>
          <Modal.Header closeButton>
            <Modal.Title>{t('profileModifyAddressTitle')}</Modal.Title>
          </Modal.Header>
          <Modal.Body >
              <div>
                <div class="mb-3">
                  <div className='form-floating my-3'>
                    <input type='text' className='form-control' 
                      placeholder=' ' name='inputAddress'
                      onChange={(e) => setAddress(e.target.value)}
                      value={address}/>
                    <label className='float-sm-left' htmlFor='inputAddress'> {t('address')} </label>
                  </div>
                </div>
              </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditAddressModal}>{t('close')}</Button>
            <Button variant="primary" onClick={handleModifyAdress}>{t('modify')}</Button>
          </Modal.Footer>
        </Modal>
    </div>
  );
}
