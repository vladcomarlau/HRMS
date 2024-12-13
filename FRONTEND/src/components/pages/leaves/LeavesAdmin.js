import * as React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import MyLeaves from './MyLeaves';
import { useTranslation } from 'react-i18next';

export default function LeavesAdmin(props) {
  //PROPS
  // currentUser = user
  const [currentUser, setCurrentUser] = useState(props.currentUser);
  const [users, setUsers] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  const [searchInput, setSearchInput] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showLeavesModal, setShowLeavesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceTemp, setTempBalance] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    getUsers();
  },[])

  const getUsers = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/leaves/users`
    }).then((response) => {
      if(response.data.length > 0) {
        setUsers(response.data);
        if(currentUser.subordinatesCount > 0) {
          setTeamUsers(response.data.filter((row) => (
            row.manager != null && row.manager.id == currentUser.id
            &&(row)
          )))
        }
        let currentUserTemp = response.data.filter((user) => {
          return user.id === currentUser.id
        })[0];
        if(currentUserTemp != null) {
          setCurrentUser(currentUserTemp);
        }
      }
    }).catch((error) => {
      console.log(error.message);
      localStorage.clear();
      window.location.reload();
    })
  }

  const searchFilter = (oldRow) => {
    if(oldRow != null && searchInput.length > 0){
      const {manager, currentEvaluation, correlationElements, avatar, subordinates, ...row} = oldRow;
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

  const handleSearchInput = (event) => {
    setSearchInput(event.target.value);
  }

  useEffect(() => {
    if ( users != null) {
      setFilteredUsers(users.filter(searchFilter)
      .map((row, index) => (
        row != null 
        &&(row)
      )));
    }
  },[users, searchInput])

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

  const managerTemp = (rowData) => {
    if(rowData.manager != null) {
      return rowData.manager.firstName + " " + rowData.manager.lastName;
    } else {
      return "-"
    }
  }

  const unapprovedTemp = (rowData) => {
    let buton = (
      <div className='btn btn-sm btn-outline-primary mx-3 px-5 py-1'
        style={{margin:"0px", display:"inline"}} onClick={() => {
          setSelectedUser(rowData);
          setShowLeavesModal(true);
        }}><Icon.Pen className='mb-1' size={"20px"}/>
      </div>
    )
    if(rowData.countPendingLeaves > 0 ) {
      return (
        <div>
          {rowData.countPendingLeaves} {buton}
        </div>
      );
    } else {
      return <div>- {buton}</div>;
    }
  }

  const editBalanceTemp = (rowData) => {
    return(
      <div>
        <div style={{display:"inline"}} className='me-2'>
          {rowData.leaveDays}
        </div>
        <div className='btn btn-sm border-0 btn-outline-dark px-5 py-1'
          style={{margin:"0px"}} onClick={()=> {
            setSelectedUser(rowData);
            setShowModifyModal(true);
            if(rowData != null) {
              setTempBalance(rowData.leaveDays);
            }
          }}><Icon.PlusSlashMinus size={"20px"}/>
        </div>
      </div>
    )
  }

  const leavesTable = (users, height, sortBy) => {
    return (
      <DataTable key={_} value={users}
        tableStyle={{ minWidth: '50rem' }}
        className='custom-sm-font'
        scrollable scrollHeight={height} stripedRows selectionMode='single' size='small'
        sortField={sortBy} sortOrder={-1} paginator rowsPerPageOptions={[5, 10, 25, 50]} rows={13} 
        emptyMessage={t('perfAccountsNoResults')}>
        <Column field="id" header={t('id')} sortable frozen style={{minWidth:"40px"}}></Column>
        <Column field="fullName" header={t('fullName')} sortable style={{ minWidth: '140px' }} frozen></Column>
        <Column field="" header={t('profileManagerTitle')} body={managerTemp} sortable style={{ minWidth: '170px' }}></Column>
        <Column field="leaveDays" header={t('leaveDays')} body={editBalanceTemp} sortable style={{ minWidth: '40px' }}></Column>
        <Column field="countPendingLeaves" header={t('pendingLeaveRequests')} body={unapprovedTemp} sortable style={{ minWidth: '40px' }} frozen></Column>
      </DataTable>
    )
  }

  const modifySold = (userId, numberOfDays) => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "PUT",
      url: `http://localhost:8082/users/${userId}/leaveDays/${numberOfDays}`
    }).then((response) => {
      if(response.data == t('leaveDaysModifiedSYSTEM')) {
        alert(t('leaveDaysModifiedMessage'));
        getUsers();
        forceUpdate();
        setShowModifyModal(false);
      }
    }).catch((error) => {
      console.log(error.message);
      localStorage.clear();
      window.location.reload();
    })
  }

  const handleModifySold = () => {
    if(selectedUser != null && balanceTemp >= 0) {
      modifySold(selectedUser.id, balanceTemp);
    }
  }

  const handleCloseLeavesModal = () => {
    getUsers();
    setShowLeavesModal(false);
  }

  return (
    <div>
      <h3 className='fw-lighter'><Icon.CalendarDateFill size={22} style={{marginBottom:'6px'}}/><Icon.Gear size={22} style={{margin:'0px 3px 6px 6px'}}/>  {t('leaveManagementTitle')}</h3><hr/>
      {teamUsers.length > 0 && (<div className='alert alert-secondary p-2'>
        <h3 className='fw-lighter'><Icon.PeopleFill size={22} style={{marginBottom:'6px'}}/>  {t('subordinatesLeavesTitle')}</h3>
        {leavesTable(teamUsers, "250px", "countPendingLeaves")}
      </div>)}
      
      <div className='text-secondary alert alert-light'>
        <h3 className='fw-lighter'><Icon.PersonFill size={25} style={{marginBottom:'6px'}}/> {t('leavesRequestOrganizationTitle')}</h3>
        {t('accounts')}: {users.length}
          {search}
          {searchInput.length > 0 && 
            <div className='mt-3'>
              {t('searchResults')}: {filteredUsers.length}
            </div>}
      </div>
      <div className='alert alert-light p-2'>
        {leavesTable(filteredUsers, "700px", "id")}
      </div>

      <Modal show={showModifyModal} onHide={()=>setShowModifyModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>{t('leaveDaysModifyNumberTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body key={_}>
            <div className='px-3'>
              {selectedUser != null && (
                <div>
                  <div>{t('newLeaveDaysNumber')}</div>
                  <div className='alert alert-light my-2'>
                    <div>{t('id')}: {selectedUser.id}</div>
                    <div>{t('fullName')}: {selectedUser.fullName}</div>
                  </div>
                  <div className='d-flex justify-content-center my-3'>
                    <div className='btn btn-primary' onClick={() => setTempBalance(balanceTemp-1)}><Icon.Dash size={30}/></div>
                    <div className='fs-3 mx-3'>{balanceTemp}</div>
                    <div className='btn btn-primary' onClick={() => setTempBalance(balanceTemp+1)}><Icon.Plus size={30}/></div>
                  </div>
                </div>
              )}
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowModifyModal(false)}>{t('cancel')}</Button>
          <Button variant="primary" onClick={() => handleModifySold()}>{t('modify')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLeavesModal} onHide={()=>handleCloseLeavesModal()} size="lg" fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>{t('leavesManagementOf')} {selectedUser != null && (selectedUser.firstName + " " + selectedUser.lastName)}</Modal.Title>
        </Modal.Header>
        <Modal.Body key={_}>
            <div className='px-3'>
              {selectedUser != null && (
                <div>
                  <MyLeaves currentUser={selectedUser} edit editingUser={currentUser}/>
                </div>
              )}
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>handleCloseLeavesModal()}>{t('close')}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
