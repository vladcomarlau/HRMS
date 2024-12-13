import * as React from 'react';
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import axios from 'axios';
import blank from '../../../../blank.jpg';
import { useTranslation } from 'react-i18next';

export default function SearchBarTeam(props) {
    const [showSearch, setShowSearch] = useState(false);
    const [search, setSearch] = useState("");
    const [content, setContent] = useState([]);
    const [elements, setElements] = useState([]);
    const [avatars] = useState(new Map());
    const [updated, setUpdated] = useState(false);
    const { t } = useTranslation();

    const getContent = () => {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/users`
        }).then((response) => {
            setContent(response.data);
        }).catch(function (error) {
            window.dispatchEvent(new Event("storage"));
            console.log(error.message)
            window.location.reload();
        });
    }

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
        if(props.noSubordinates) {
            if(oldRow != null && search.length > 0){
                const {manager, correlationElements, currentEvaluation, avatar, subordinates, ...row} = oldRow;
                let matchesName = (row.firstName + " " + row.lastName)
                    .toLowerCase().includes(search.toLowerCase());
                let matchesNameReversed = (row.lastName + " " + row.firstName)
                    .toLowerCase().includes(search.toLowerCase());
                return (((JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
                    || matchesName
                    || matchesNameReversed)
                    && oldRow.subordinatesCount === 0));
            } else{
                return true;
            }
        } else {
            if(oldRow != null && search.length > 0){
                const {manager, correlationElements, currentEvaluation, avatar, subordinates, ...row} = oldRow;
                let matchesName = (row.firstName + " " + row.lastName)
                    .toLowerCase().includes(search.toLowerCase());
                let matchesNameReversed = (row.lastName + " " + row.firstName)
                    .toLowerCase().includes(search.toLowerCase());
                return ((JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
                    || matchesName
                    || matchesNameReversed));
            } else{
                return true;
            }
        }
    }

    const fetchAvatar = (userId, avatarId) => {
        axios.get("http://localhost:8082/avatars/" + avatarId, {
          responseType: 'arraybuffer',
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }).then((response) => {
          const base64 = btoa( //string -> base 64
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),''));
          avatars.set(userId, `data:;base64,${base64}`);
        }).catch(function (error) {
          console.log(error.message);
        });
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
            setUpdated(!updated);
        }
    },[content, search])

    const handleAdd = (row) => {
        if(row != null) {
            props.selectedUserCallback(row);
        }
    }
    
    useEffect(() => {
        let rows = content.filter(searchFilter)
            .map((row) => (
                <div key={row.id} onMouseDown={() => handleAdd(row)}
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

    return (
        <>
            <div className='bg-secondary border border-end-0
                bg-opacity-10 text-dark float-end'
                style={{margin:"5px -5px 25px 5px",
                    padding:"0px 5px 0px 5px",
                    borderRadius:"5px 0px 0px 5px"}}>
                <Icon.Search/>
            </div>

            <input className="customForm border bg-secondary 
                bg-opacity-10 text-dark float-end"
                type="search"
                style={{width:"100%", height:"30px", maxWidth:"90%", 
                    padding:"10px 10px 10px 5px", margin:"5px 5px 25px 5px",
                    borderRadius:"0px 5px 5px 0px"}}
                placeholder={t('searchAccountPH')} aria-label="Search"

                onFocus={() => setShowSearch(true)}
                onBlur={() => setShowSearch(false)}
                onChange={(e) => setSearch(e.target.value)}
                value = {search}/>

            <div className = {showSearch && search.length > 0 ?
                    'dropdown-content shadow':
                    'dropdown-content invisible'}
                style={{borderRadius:"10px", left:"37px", zIndex:"999",
                    marginTop:"33px"}}>
                <div className='table-responsive'
                    style={{maxHeight:"300px"}}>
                    {elements.length>0 ? elements:t('perfAccountsNoResults')}
                </div>  
            </div>
        </>
    );
}
