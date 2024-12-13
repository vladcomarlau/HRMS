import * as React from 'react';
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import axios from 'axios';
import blank from '../../blank.jpg';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Profile from '../pages/profile/Profile';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SearchBar() {
    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState("");
    const [content, setContent] = useState([]);
    const [elements, setElements] = useState([]);
    const [avatars] = useState(new Map());
    const [updated, setUpdated] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [viewedProfileID, setViewedProfileID] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    const { t } = useTranslation();
  
    const getContent = () => {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/users/search`
        }).then((response) => {
            setContent(response.data);
        }).catch(function (error) {
            window.dispatchEvent(new Event("storage"));
            console.log(error.message)
            window.location.reload();
        });
    }

    useEffect( () => {
        let id = parseInt(searchParams.get('user'));
        if((id !== null || NaN) && id >= 1) {
            setViewedProfileID(id);
            setShowProfileModal(true);
        }
    }, [])

    useEffect( () => {
        const getContentIfToken = () => {
            const token = localStorage.getItem('token')
            if( token && token.length !== 0){
                getContent();
            }
        }
        getContent();

        window.addEventListener('storage',getContentIfToken);
        return( () => {
            window.removeEventListener('storage',getContentIfToken);
        })
    },[search])

    const searchFilter = (oldRow) => { 
        if(oldRow != null && search.length > 0){
            const {manager, correlationElements, address, password, leaves, avatar, subordinates, currentEvaluation, ...row} = oldRow;
            let matchesName = (row.firstName + " " + row.lastName)
                .toLowerCase().includes(search.toLowerCase());
            let matchesNameReversed = (row.lastName + " " + row.firstName)
                .toLowerCase().includes(search.toLowerCase());
            return JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
                || matchesName
                || matchesNameReversed;
        } else{
            return true;
        }
    }

    const fetchAvatar = (userId, avatarId) => {
        axios.get("http://localhost:8082/avatars/" + avatarId, {
          responseType: 'arraybuffer',
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }).then((response) => {
          const base64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),''));
          avatars.set(userId, `data:;base64,${base64}`);
        }).catch(function (error) {
          console.log(error.message);
        });
    }

    const handleCloseModal = () => {
        setShowProfileModal(false);
        setSearchParams({user : ""});
    }

    useEffect(() => {
        if(content != null 
            && content.length>0) {
            let rows = content.filter(searchFilter);
            for(let i = 0; i < rows.length; i++) {
                if(content[i].avatar != null) {
                    fetchAvatar(content[i].id, content[i].avatar.id)
                } else{
                    avatars.set(content[i].id, blank)
                }
            }
            setUpdated(!updated)
        }
    },[content, search])

    const showProfile= (row) => {
        setViewedProfileID(row.id);
        setSearchParams({user : row.id});
        setShowProfileModal(true);
    } 
    
    useEffect(() => {
        let rows = content.filter(searchFilter).slice(0,20)
            .map((row) => (
                <div key={row.id} onMouseDown={() => showProfile(row)}
                    role="button" className="row mb-1 customHover"    
                    style={{padding:"0px 0px 1px 10px", marginBottom:"-5px"}}>
                    <img src={avatars.get(row.id)} onDragStart={(e) => {e.preventDefault()}}
                        className="col-4 p-0 m-2 rounded-circle"
                        style={{width:"50px", height: "50px", objectFit: "cover"}} 
                        alt="" loading="lazy"/>
                    <div style={{padding:"0px", margin:"8px 0px 3px 0px", width:"70%"}}
                        className=''>
                            {row.firstName} {row.lastName} 
                            <br></br><small className='text-muted'>{row.jobTitle}</small></div>
                </div>
            ))
            setElements(rows);
    },[content, updated])

    return (<>
        <div className='bg-secondary border border-end-0
            bg-opacity-10 text-dark float-end'
            style={{margin:"5px -5px 5px 5px",
                padding:"0px 5px 0px 5px",
                borderRadius:"5px 0px 0px 5px"}}>
            <Icon.Search/>
        </div>
        <input className="customForm border bg-secondary 
            bg-opacity-10 text-dark float-end"
            type="search"
            style={{width:"100%", height:"30px", maxWidth:"200px", 
                padding:"10px 10px 10px 5px", margin:"5px 5px 5px 5px",
                borderRadius:"0px 5px 5px 0px"}}
            placeholder={t('userSearchPlaceholder')} aria-label="Search"

            onFocus={() => setShowSearch(true)}
            onBlur={() => setShowSearch(false)}
            onChange={(e) => setSearch(e.target.value)}
            value = {search}/>
        <div className = {showSearch && search.length > 0 ?
                'dropdown-content shadow':
                'dropdown-content invisible'}
            style={{borderRadius:"10px", left:"-1px", zIndex:"999",
                marginTop:"10px"}}>
            <div className='table-responsive'
                style={{maxHeight:"300px"}}>
                {elements.length>0 ? elements:t('perfAccountsNoResults')}
            </div>  
        </div>
        
        <Modal show={showProfileModal} onHide={handleCloseModal} fullscreen>
            <Modal.Header closeButton className='m-4'>
            <Modal.Title>{t('profileTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <div>
                    <div class="mb-3">
                        {viewedProfileID != null && (<Profile notMe={viewedProfileID} search/>)}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='m-4'>
            <Button variant="secondary" onClick={handleCloseModal}>{t('close')}</Button>
            </Modal.Footer>
        </Modal>
    </>);
}
