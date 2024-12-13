import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Team from '../../organization/Team';
import ProfileCard from '../../organization/ProfileCard';
import * as Icon from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import SearchBarTeam from './SearchBarTeam';
import { useTranslation } from 'react-i18next';

export default function TeamsMan() {
  const [managers, setManagers] = useState([]);
  const [managerCards, setManagerCards] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [updated, setUpdated] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [members] = useState(new Map());
  const [memberCards, setMemberCards] = useState([])
  const { t } = useTranslation();

  const handleCloseAddModal = () => setShowAddModal(false);

  const handleOpenAdd = () => {
    setSelectedNewManager(null);
    members.clear();
    setMemberCards([]);
    setShowAddModal(true);
  }

  const handleAdd = () => {
    setShowAddModal(false);
    if(selectedNewManager != null && members != null && members.size > 0) {
      let myError = false;
      let ids = Array.from(members);
      for(let i = 0; i < ids.length; i++) {
        axios.request({
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          method: "POST",
          url: `http://localhost:8082/users/${selectedNewManager.id}/${ids[i][0]}`
        }).then((res) => {
          alert(res.data);
        }).catch((error) => {
          console.log(error.message);
          myError = true;
        })
      }
      if(myError) {
        alert(t('teamCreatedError'));
      }
    }
    setUpdated(!updated);
    window.dispatchEvent(new Event("refreshAllTeams"));
  }

  useEffect(() => {
    fetchUsers();
    const handleRefresh = () => {
      fetchUsers();
      setSelectedManager(null);
      setManagerCards([]);
      setSearchInput("");
      setUpdated(!updated);
    }

    window.addEventListener("refreshAllTeams", handleRefresh);
    return (() => {
      window.removeEventListener("refreshAllTeams", handleRefresh);
    })
  },[])

  const fetchUsers = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/users`
    }).then((responseAuth) => {
      setManagers(responseAuth.data.filter(leaderFilter));
    }).catch((error) => {
      console.log(error.message);
      window.location.reload();
    })
  }

  const leaderFilter = (manager) => {
    return manager.hasSubordinates;
  }

  const searchFilter = (oldRow) => {
    if (searchInput != null && searchInput.length > 0) {
      if(oldRow != null){
        const {manager, correlationElements, currentEvaluation, avatar, subordinates, authorities, 
          address, cnp, employmentDate, birthdate, createdAt, updatedAt, 
          password, subordinatesCount, ...row} = oldRow;
        let matchesName = (row.firstName + " " + row.lastName)
            .toLowerCase().includes(searchInput.toLowerCase());
        let matchesNameReversed = (row.lastName + " " + row.firstName)
            .toLowerCase().includes(searchInput.toLowerCase());
        return JSON.stringify(row).toLowerCase().includes(searchInput.toLowerCase())
            || matchesName
            || matchesNameReversed;
      } else {
        return true;
      }
    } else {
      return true;
    } 
  }

  const handleManagerSelection = (manager) => {
    setSelectedManager(manager);
    setUpdated(!updated);
  }

  useEffect(() => {
    setManagerCards(managers.filter(searchFilter)
    .map((elem, index) =>
    (<div className='mx-0 p-2 col-12 col-sm-6 col-md-6 col-lg-4'>
        {elem != null && (
        <div key={index+updated} className='btn btn-outline-light alert alert-light py-1 mx-0 px-0'
          style={{width:"100%", height:"100%"}}
          onClick={() => handleManagerSelection(elem)}>
          <ProfileCard id={elem.id} count={elem.subordinatesCount}/>
        </div>)} 
    </div>)));
    setUpdated(!updated);
  },[searchInput, managers])

  const search = (
    <div className="mt-2 col-12 col-xs-12 col-md-7 col-lg-5">
      <div className="text-start">
          <div className="input-group">
              <input className="form-control border" type="search" 
                  placeholder={t('teamEvaluationSearchLeader')} onChange={(e) => {
                    setSearchInput(e.target.value);
                  }}/>
          </div>
      </div>
    </div>)

  const searchComponent = (
    <div className='text-secondary alert alert-light mt-4'>
      {t('totalTeams')}: {managers.length}
      {search}
      {searchInput.length > 0 && 
        <div className='mt-3'>
          {t('searchResults')}: {managerCards.length}
        </div>}
    </div>
  )

  const handleReturnToAllTeams = () => {
    fetchUsers();
    setSelectedManager(null);
    setManagerCards([]);
    setSearchInput("");
    setUpdated(!updated);
  }

  const selectedNewManagerCallback = (user) => {
    setSelectedNewManager(user);
    setUpdated(!updated);
  }

  const redrawMembers = () => {
    let tempMemberCards = Array.from(members)
          .map((member, index) => (
            <div className='mx-0 p-2 col-12 col-sm-6 col-md-6 col-lg-4'>
              <div key={index+updated} className='border py-1 mx-0 px-0'
                style={{width:"100%", height:"100%"}}>
                <button className='btn btn-sm btn-outline-danger m-1 border-0 text-end'
                            onClick={() => handleDeleteMember(member[0])}>
                                <Icon.PersonDash size={23} style={{margin:"-2px 8px 0px 0px"}}/></button>
                <ProfileCard key={index} id={member[0]}/>
              </div>
            </div>
          ))
          setMemberCards(tempMemberCards)
          setUpdated(!updated);
  }

  const handleDeleteMember = (member) => {
    members.delete(member);
    redrawMembers();
    setUpdated(!updated);
  }

  const selectedMemberCallback = (user) => {
    if(user.id != selectedNewManager.id) {
      if(selectedNewManager.manager != null) {
        if(user.id != selectedNewManager.manager.id) {
          members.set(user.id);
          redrawMembers();
        } else {
          alert(t('addMemberErrorIsManagersSuperior'));
        }
      } else {
        members.set(user.id);
        redrawMembers();
      }
    } else {
      alert(t('addMemberErrorIsManager'));
    }
  }

  return (
    <div>
      <h3 className='fw-lighter'><Icon.PeopleFill size={24} style={{marginBottom:'4px'}}/> {t('teamListTitle')}</h3><hr/>
      <h5 className='fw-light text-secondary'>{t('teamListDescription')}</h5>
      <div className='p-2'>
        {(selectedManager != null 
        ? ((
          <div>
            <button className='btn btn-sm btn-outline-primary border-0'
              style={{marginBottom:"2px"}}
              onClick={() => handleReturnToAllTeams()}>
                <Icon.ArrowReturnLeft/> {t('allTeams')}
            </button>
            <Team currentUser={selectedManager} for={"allTeams"} edit/>
          </div>))
        : (<div>
            {searchComponent} 
            <button
              className={'btn btn-sm btn-outline-primary m-1 border-0'}
              onClick={() => handleOpenAdd()}>
                  <Icon.PeopleFill size={20} style={{margin:"-2px 8px 0px 0px"}}/>
                      {t('createNewTeamButton')}</button>
          </div>))}
        {selectedManager == null && (<div className='row flexrow'>{managerCards} </div>)}
      </div>

      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('newTeamTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body key={updated}>
            <div className='px-3'>
              {t('mewTeamDescription1')} <small className='text-secondary'>{t('mewTeamDescription2')}</small>
              {(<ul className='nav nav-pills nav-fill'><SearchBarTeam selectedUserCallback={selectedNewManagerCallback} noSubordinates/></ul>)}
              {(selectedNewManager != null && <h5 className='fw-light'>{t('mewTeamDescription3')}:</h5>)}
              {(selectedNewManager != null && <ProfileCard id={selectedNewManager.id}/>)}
              {(selectedNewManager != null && <h5 className='fw-light'>{t('mewTeamDescription4')}:</h5>)}
              {selectedNewManager != null && (<ul className='nav nav-pills nav-fill'><SearchBarTeam selectedUserCallback={selectedMemberCallback}/></ul>)}
              <div className='row flexrow'>{(memberCards)}</div>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
              {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleAdd}>
              {t('createTeam')}
          </Button>
        </Modal.Footer>
    </Modal>
    </div>
  );
}