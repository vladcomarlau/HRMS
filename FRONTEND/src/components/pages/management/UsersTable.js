import * as React from 'react';
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import SearchBarTeam from './teamsMan/SearchBarTeam';
import ProfileCard from '../organization/ProfileCard';
import { useTranslation } from 'react-i18next';

export default function UsersTable(data) {
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const { t } = useTranslation();

  const [elements, setElements] = useState([]);
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)
  const [selectedRow, setSelectedRow] = useState("")
  const [password, setPassword] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [role, setRole] = useState("USER")

  const [step1, setStep1] = useState("");
  const [step2, setStep2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cnp, setCnp] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [address, setAddress] = useState("");
  const [employmentDate, setEmploymentDate] = useState("");

  const [currentManager, setCurrentManager] = useState(null);

  const [updated, setUpdated] = useState(false);

  const elPerPage = 10;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleCloseModifyModal = () => {setShowModifyModal(false)};

  const handleShowDeleteModal = (row) => {
    setCurrentManager(null);
    setShowDeleteModal(true);
    setSelectedRow(row);
  }

  const handleShowModifyModal = (row) => {
    if (row != null) {
      setShowModifyModal(true);
      setSelectedRow(row);
      setFirstName(row.firstName);
      setLastName(row.lastName);
      setRole(row.role);
      setStep1("");
      setStep2("");
      setAddress(row.address);
      setCnp(row.cnp);
      setBirthdate(row.birthdate);
      setEmploymentDate(row.employmentDate);
      setJobTitle(row.jobTitle);
      setPhoneNumber(row.phoneNumber);
    }
  }

  const handlePasswordInput = (event) => {
    setPassword(event.target.value);
  }

  const handleSearchInput = (event) => {
    setSearchInput(event.target.value);
    setPage(0)
  }

  const deleteRequest = async (selectedRow) => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "DELETE",
      url: `http://localhost:8082/users/${selectedRow.id}`
    }).then((response) => {
      setShowDeleteModal(false);
      alert(response.data);
      window.dispatchEvent(new Event("refreshList"));
    }).catch(function (error) {
      console.log(error.message);
      alert(t('userDeletedErrorMessage'));
      window.dispatchEvent(new Event("refreshList"));
    });
  }

  const modifyManagerRequest = async (selectedRow, i) => {
    if(selectedRow.subordinatesIDs[i] != null) {
      let modifyOrDelete = selectedRow.subordinatesIDs[i] != currentManager.id;
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: modifyOrDelete ? "POST" : "DELETE",
          url: modifyOrDelete ? `http://localhost:8082/users/${currentManager.id}/${selectedRow.subordinatesIDs[i]}` : `http://localhost:8082/users/${selectedRow.id}/${currentManager.id}`
      }).then((res) => {
        if(res.data != null) {
          if(i === selectedRow.subordinatesIDs.length-1) {
            deleteRequest(selectedRow);
          } else {
            if (i < selectedRow.subordinatesIDs.length) {
              i++;
            }
            modifyManagerRequest(selectedRow, i);
          }
        }
      }).catch((error)=>{
        console.log(error);
      });
    } else {
      alert(t('userDeletedPartiallyError'));
    }
  }

  const handleDelete = () => {
    if(!password && password.length === 0) {
      alert(t('passwordRequired'));
    } else {
      if((selectedRow.subordinatesIDs != null
        && selectedRow.subordinatesIDs.length > 0)
        && currentManager === null) {
          alert(t('userDeletedErrorMessage2'));
      } else {
        axios.request({
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: "GET",
          url: `http://localhost:8082/users/jwt`
        }).then((responseAuth) => {
          let userData = {
            email: responseAuth.data.email,
            password: password
          }
          axios.post('http://localhost:8082/signin', userData)
          .then((response) => {
            if(response.data.token && response.data.token.length !== 0) {
              if(responseAuth.data.id === selectedRow.id) {
                alert(t('errorDeleteSelf'));
              } else {
                console.log(selectedRow);
                if(selectedRow != null) {
                  if(selectedRow.subordinatesCount > 0) {
                    if(currentManager != null) {
                      modifyManagerRequest(selectedRow, 0);
                    }
                  } else {
                    deleteRequest(selectedRow);
                  }
                }
              }
            }}
          ).catch(function (error) {
            console.log(error.message);
            alert(t('incorrectPassword'));
          });
        }).catch(function (error) {
          console.log(error.message);
          alert(error.message);
        });
      }
    }
  }

  const handleModify = (e) => {
    if(!password && password.length === 0) {
      alert(t('passwordRequired'))} else {
        let userData = {
          firstName: firstName,
          lastName: lastName,
          password: step1,
          role: role,
          birthdate: birthdate,
          employmentDate: employmentDate,
          phoneNumber: phoneNumber,
          cnp: cnp,
          jobTitle: jobTitle,
          address: address
        }
        let formComplete = false;
        for (var member in userData) {
          if (userData[member].replace(/ /g,'').length > 0) {
            formComplete = true;
          }
        }
        if(role.length > 0){ formComplete = true; }
        if(!formComplete 
          || (step1 !== step2)
          || ((step1 .replace(/ /g,'').length > 0 
            || step2 .replace(/ /g,'').length > 0)
            && (checkpassword(step1) !== 100
            || checkpassword(step2) !== 100))) {
            alert(t('incompleteForm'));
        } else {
          axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/users/jwt`
          }).then((responseAuth) => {
            let userDataAuth = {
              email: responseAuth.data.email,
              password: password
            }
            axios.post('http://localhost:8082/signin', userDataAuth
            ).then((response) => {
              if(response.data.token && response.data.token.length !== 0) {
                  axios.request({
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    data: userData,
                    method: "PUT",
                    url: `http://localhost:8082/users/${selectedRow.id}`
                  }).then((response) => {
                    setShowModifyModal(false);
                    if(response.data !== null) {
                      alert(t('userModified'));
                      window.dispatchEvent(new Event("refreshList"));
                    }
                  }).catch(function (error) {
                    console.log(error.message);
                    localStorage.clear();
                    window.location.reload();
                  });
                }
              }
            ).catch(function (error) {
              alert(t('incorrectPassword'));
              console.log(error.message);
            });
          }).catch(function (error) {
            console.log(error.message)
          });
        }
      }
  }

  const checkpassword = (password) => {
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
    return strengthbar
  }

  const searchFilter = (oldRow) => {
    if(oldRow != null && searchInput.length > 0){
      const {manager, correlationElements, currentEvaluation, avatar, subordinates, ...row} = oldRow;
      let matchesName = (row.firstName + " " + row.lastName)
          .toLowerCase().includes(searchInput.toLowerCase());
      let matchesNameReversed = (row.lastName + " " + row.firstName)
          .toLowerCase().includes(searchInput.toLowerCase());
      return JSON.stringify(row).toLowerCase().includes(searchInput.toLowerCase())
          || matchesName
          || matchesNameReversed;
    } else{
        return true;
    }
  }

  function readJavaDate(date) {
    return date.slice(0, 10) + " " + date.slice(11,16);
  }
  
  useEffect(() => {
    if ( data != null) {
      let rows = data.data.filter(searchFilter)
      .map((row, index) => (
        row != null 
        &&( 
        <tr key={index} style={{whiteSpace: "nowrap"}}>
          <th scope='row'><small>{row.id}</small></th>
          <td><small className='btn btn-sm btn-outline-dark border-0'
            onClick={() => handleShowModifyModal(row)}><Icon.Pen/></small> 
            <small className='btn btn-sm btn-outline-danger mx-1 border-0'
            onClick={() => handleShowDeleteModal(row)}><Icon.Trash3/></small></td>
          <td><small>{row.email}</small></td>
          <td><small>{row.firstName}</small></td>
          <td><small>{row.lastName}</small></td>
          <td><small>{row.jobTitle}</small></td>
          <td><small>{row.manager != null ?
            (row.manager.firstName + " " + row.manager.lastName) :
            "-"}</small></td>
          <td><small className='d-flex justify-content-center'>{(row.subordinatesCount > 0) && <Icon.PeopleFill size={20}/>}</small></td>
          <td><small>{row.role}</small></td>
          <td><small>{readJavaDate(row.createdAt)}</small></td>
          <td><small>{readJavaDate(row.updatedAt)}</small></td>
        </tr>)
      )).reverse();
      setPages(Math.floor((rows.length-1)/elPerPage))
      rows = rows.slice(elPerPage*page, elPerPage*(page+1));
      setElements(rows)
    }
  },[page, data, searchInput])

  const changePage = (x) => {
    let current = Math.min(pages, Math.max(page+x,0));
    setPage(current);
  }

  const pageNumbers = () => {
    let numbers = [];
    for (let i = Math.max(0, (page-4)); 
          i < Math.min((Math.max(0, (page-4))+4), pages)+1; 
          i++){
        numbers.push(<button className={(page+1 === i+1) ? 
            "p-0 px-2 btn btn-outline-dark rounded h2": 
            "p-0 px-2 btn btn-outline-dark rounded h2 border-0"}
          onClick={() => setPage(i)}>{i+1}</button>)
    }
    return numbers;
  }

  let pagination = (
    <div className='row'>
      <div className='col-4 text-muted'>
        {t('page')} {page+1}/{pages+1}
        <button className='btn btn-outline-dark border-0' 
          style={{height:"23px", margin:"0px 2px 2px 10px"}} 
          onClick={() => {
            window.dispatchEvent(new Event("refreshList"))
            alert(t('listUpdated'))
          }}>
            <div style={{marginTop:"-8px"}}>
              <Icon.ArrowClockwise size={18}/>
            </div>
        </button>
      </div>
      <div className='text-end col-8'>
        <div className="btn-group btn-group-sm mb-2" 
        role="group" style={{height:"30px", width:"300px"}}>
          <button style={{height:"22px"}} 
            className='btn btn-sm btn-outline-dark border-0 mx-1 rounded'
            onClick={() => setPage(0)} >
            <Icon.ChevronDoubleLeft style={{marginTop:"-10px"}}/></button>
          <button style={{height:"22px"}} 
            className='btn btn-sm btn-outline-dark border-0 mx-1 rounded'
            onClick={() => changePage(-1)}>
            <Icon.ChevronLeft style={{marginTop:"-10px"}}/></button>
          {pageNumbers()}
          <button style={{height:"22px"}}
            onClick={() => changePage(1)}
            className='btn btn-sm btn-outline-dark border-0 mx-1 rounded'>
            <Icon.ChevronRight style={{marginTop:"-10px"}}/></button>
          <button style={{height:"22px"}} 
            className='btn btn-sm btn-outline-dark border-0 mx-1 rounded'
            onClick={() => setPage(pages)}>
            <Icon.ChevronDoubleRight style={{marginTop:"-10px"}}/></button>
        </div>
      </div>
    </div>
  )

  const search = (
    <div className="mt-2 col-12 col-xs-12 col-md-7 col-lg-5">
      <div className="text-start">
          <div className="input-group">
              <input className="form-control border" type="search" 
                  placeholder={t('searchAccountPH')} onChange={handleSearchInput}/>
          </div>
      </div>
    </div>
  )

  const selectedUserCallback = (user) => {
    setCurrentManager(user);
    setUpdated(!updated);
  }

  return (
    <div>
      
      <div className='text-secondary alert alert-light mt-4'>
        {t('accounts')}: {data.data.length}
        {search}
        {searchInput.length > 0 && 
          <div className='mt-3'>
            {t('searchResults')}: {elements.length} 
          </div>}
      </div>
      {pagination}
      <div className='table-responsive' style={{minHeight:"550px"}}>
        <table className='table table-lg table-hover'>
          <thead>
            <tr className='text-center' style={{whiteSpace: "nowrap"}}>
              <th scope='col'>{t('id')}</th>
              <th scope='col'></th>
              <th scope='col'>{t('id')}</th>
              <th scope='col'>{t('firstName')}</th>
              <th scope='col'>{t('lastName')}</th>
              <th scope='col'>{t('jobTitle')}</th>
              <th scope='col'>{t('profileManagerTitle')}</th>
              <th scope='col'>{t('hasTeam')}</th>
              <th scope='col'>{t('permissions')}</th>
              <th scope='col'>{t('createdOn')}</th>
              <th scope='col'>{t('updatedOn')}</th>
            </tr>
          </thead>
          <tbody>{elements}</tbody>
        </table>
      </div>  
      <div className='mt-3'>
        {pagination}
      </div>
      <div
        className="modal show"
        style={{ display: 'block', position: 'initial' }}></div>
        <div
    className="modal show"
    style={{ display: 'block', position: 'initial' }}>

    <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('deleteAccountTitle')}</Modal.Title>
      </Modal.Header>
      <Modal.Body >
          <div className='p-3'>
            <div className='alert alert-danger'>{t('deleteAccountAlert')}</div>
            <Table striped bordered hover size="sm" responsive>
              <tbody>
                <tr>
                  <td>{t('id')}</td>
                  <td>{selectedRow.id}</td>
                </tr>
                <tr>
                  <td>{t('email')}</td>
                  <td>{selectedRow.email}</td>
                </tr>
                <tr>
                  <td>{t('fullName')}</td>
                  <td>{selectedRow.firstName + " " + selectedRow.lastName}</td>
                </tr>
                <tr>
                  <td>{t('jobTitle')}</td>
                  <td>{selectedRow.jobTitle}</td>
                </tr>
                <tr>
                  <td>{t('profileManagerTitle')}</td>
                  <td>{selectedRow.manager != null && (selectedRow.manager.firstName + " " + selectedRow.manager.lastName)}</td>
                </tr>
              </tbody>
            </Table><br></br>
            <div>
              {(selectedRow.subordinatesCount > 0 && 
                (<div>
                    <div className='alert alert-warning'>
                      <h5 className='fw-light'>{t('accountDeleteHasSubordinatesAlert')}</h5>
                      <div>{t('accountDeleteHasSubordinatesAlertDescription')}<br></br></div>
                  </div>
                </div>))}
                <div key={updated}>
                  {(selectedRow.subordinatesCount > 0 
                    && (<ul className='nav nav-pills nav-fill'><SearchBarTeam managerId={currentManager} selectedUserCallback={selectedUserCallback}/></ul>))}
                  {(currentManager != null && (
                    <div>
                      <div className='text-secondary'>{t('newManagerWillBe')}:</div>
                      <ProfileCard id={currentManager.id}/>
                    </div>
                  ))}
                </div>
            </div><br></br>
            <div>{t('accountDeleteRequiresPassword')}:</div>
            <br></br>
            <input type='password' className='form-control' 
                      placeholder={t('passwordPH')} name='passwordInput'
                      onChange={handlePasswordInput}/>
          </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDeleteModal}>
          {t('close')}
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          {t('remove')}
        </Button>
      </Modal.Footer>
    </Modal>
    
    <Modal show={showModifyModal} onHide={handleCloseModifyModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('modifyAccountTitle')}</Modal.Title>
      </Modal.Header>
      <Modal.Body >
          <div className='p-3'>
            <div className='alert alert-warning'>
              <div className='mb-3'>{t('modifyAccountAlert')}</div>
              <Table striped bordered hover size="sm" responsive>
                <tbody>
                  <tr>
                    <td>{t('id')}</td>
                    <td>{selectedRow.id}</td>
                  </tr>
                  <tr>
                    <td>{t('email')}</td>
                    <td>{selectedRow.email}</td>
                  </tr>
                  <tr>
                    <td>{t('fullName')}</td>
                    <td>{selectedRow.firstName + " " + selectedRow.lastName}</td>
                  </tr>
                  <tr>
                    <td>{t('jobTitle')}</td>
                    <td>{selectedRow.jobTitle}</td>
                  </tr>
                  <tr>
                    <td>{t('profileManagerTitle')}</td>
                    <td>{selectedRow.manager != null && (selectedRow.manager.firstName + " " + selectedRow.manager.lastName)}</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            <div className='row'>
              <form className='px-3'>
                <div className='form-floating my-3'>
                    <input type='text' className='form-control' 
                      placeholder=' 'name='inputFirstname'
                      onChange={(e) => setFirstName(e.target.value)}
                      value={firstName}/>
                    <label className='float-sm-left' htmlFor='inputFirstname'> {t('firstName')} </label>
                </div>
                <div className='form-floating my-3'>
                    <input type='text' className='form-control' 
                      placeholder=' 'name='inputLastName'
                      onChange={(e) => setLastName(e.target.value)}
                      value={lastName}/>
                    <label className='float-sm-left' htmlFor='inputLastName'> {t('lastName')} </label>
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
                name='inputPhoneNumber' placeholder={t('phoneNumber')}
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
                name='inputJobTitle' placeholder={t('employedPH')}
                onChange={(e) => setJobTitle(e.target.value)}
                value={jobTitle}/>
              <label className='float-sm-left' htmlFor='inputJobTitle'> 
              {t('jobTitle')} </label>
          </div>
                <div className='form-floating my-3'>
                    <input type='password' className='form-control' 
                      placeholder={t('passwordPH')} name='passwordInput'
                      onChange={(e) => setStep1(e.target.value)}
                      value={step1}/>
                    <label htmlFor='passwordInput'> {t('passwordPH')} </label>
                </div>
                <div className='form-floating my-3'>
                  <input type='password' className='form-control' 
                    placeholder={t('confirmPasswordPH')} name='passwordInputConfirm'
                    onChange={(e) => setStep2(e.target.value)}
                    value={step2}/>
                  <label htmlFor='passwordInputConfirm'> {t('confirmPasswordPH')} </label>
                </div>
                {step1!==step2 && <div class="alert alert-danger">
                  {t('passwordConfirmationError')}
                </div>}
                {(step1.length <= 6
                || step2.length >= 15
                || checkpassword(step1)!==100 
                || checkpassword(step2)!==100)
                && (step1.length > 0 && step2.length > 0)
                && <div class="alert alert-warning">
                  {t('passwordRequirement1')}:<br></br>
                  {t('passwordRequirement2')} <br></br>
                  {t('passwordRequirement3')} <br></br>
                  {t('passwordRequirement4')} <br></br>
                  {t('passwordRequirement5')} <br></br>
                  {t('passwordRequirement6')}
                </div>}
                <div className='row px-3'>
                  <div className='p-4 col-12 col-xs-12 col-sm-12 col-md-12 col-lg-6
                    alert alert-light'>
                  <div className='fw-bold my-2'>{t('role')}:</div>
                    {['radio'].map((type) => (
                      <div key={`inline-${type}`} className="mb-3">
                        <Form.Check
                          inline
                          label={t('userRoleActions')}
                          name="group1"
                          type={type}
                          id={`inline-${type}-1`}
                          onClick={()=>setRole("USER")}
                        /><br></br>

                        <Form.Check
                          inline
                          label={t('managerRoleActions')}
                          name="group1"
                          type={type}
                          id={`inline-${type}-2`}
                          onClick={()=>setRole("MANAGER")}
                        /><br></br>

                        <Form.Check
                          inline
                          label={t('administratorRoleActions')}
                          name="group1"
                          type={type}
                          id={`inline-${type}-3`}
                          onClick={()=>setRole("ADMIN")}/>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='col-12'>
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
              </form>
            </div>
            <div className='mt-3'>{t('confirmAccountModify')}:</div>
            <br></br>
            <input type='password' className='form-control' 
                      placeholder={t('passwordPH')} name='passwordInput'
                      onChange={handlePasswordInput}/>
          </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModifyModal}>{t('close')}</Button>
        <Button variant="primary" onClick={handleModify}>{t('modify')}</Button></Modal.Footer>
    </Modal>
  </div>
    </div>
  );
}