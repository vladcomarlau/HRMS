import * as React from 'react';
import { useState, useEffect } from 'react';
import Page404 from './Page404';
import Performance from './pages/performance/Performance';
import Leaves from './pages/leaves/Leaves';
import Dashboard from './pages/dashboard/Dashboard';
import Organization from './pages/organization/Organization';
import Profile from './pages/profile/Profile';
import Management from './pages/management/Management';
import Salaries from './pages/salaries/Salaries';
import Avatar from './pages/profile/Avatar';
import axios from 'axios';
import * as Icon from 'react-bootstrap-icons';
import Reports from './pages/reports/Reports';
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../localization/LanguageSelector';

export default function Viewer(props) {
    const [page, setPage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [goToMyTeam, setGoToMyTeam] = useState(false);
    const [goToAdminPerf, setGoToAdminPerf] = useState(false);
    const [goToAdminSal, setGoToAdminSal] = useState(false);
    const [goToAdminDaysOff, setGoToAdminDaysOff] = useState(false);
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const { t, i18n } = useTranslation();

    function checkAdmin () {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/users/jwt`
        }).then((responseAuth) => {
            setCurrentUser(responseAuth.data);
            if(responseAuth.data.role === "ADMIN"
            || responseAuth.data.role === "MANAGER") {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        }).catch(function (error) {
            console.log(error.message)
        });
    }

    useEffect(() => {
        setIsAdmin(checkAdmin);
        window.addEventListener("profile", () => {setPage("profile")});
        window.addEventListener("myTeam", () => { setPage("teams"); setGoToMyTeam(true)});
        window.addEventListener("allTeams", () => {setPage("teams"); setGoToMyTeam(false)});
        window.addEventListener("leaves", () => {setPage("leaves"); setGoToAdminDaysOff(false);});
        window.addEventListener("manPerfAcc", () => {setPage("performance"); setGoToAdminPerf(true);});
        window.addEventListener("manSalAcc", () => {setPage("salaries"); setGoToAdminSal(true);});
        window.addEventListener("manDaysOffAcc", () => {setPage("leaves"); setGoToAdminDaysOff(true);});
        window.addEventListener("manAcc", () => {setPage("management")});
        return (() => {
            window.removeEventListener("profile", () => {setPage("profile")})
            window.removeEventListener("myTeam", () => {setPage("teams"); setGoToMyTeam(true);});
            window.removeEventListener("allTeams", () => {setPage("teams"); setGoToMyTeam(false);});
            window.removeEventListener("leaves", () => {setPage("leaves"); setGoToAdminDaysOff(false);});
            window.removeEventListener("manPerfAcc", () => {setPage("performance"); setGoToAdminPerf(true);});
            window.removeEventListener("manSalAcc", () => {setPage("salaries"); setGoToAdminSal(true);});
            window.removeEventListener("manDaysOffAcc", () => {setPage("leaves"); setGoToAdminDaysOff(true);});
            window.removeEventListener("manAcc", () => {setPage("management")});
        })
    },[])

    const navigate = useNavigate(); 
    const routeChange = (path) =>{ 
        let newPath = `/${path}`; 
        navigate(newPath);
    }
    const location = useLocation();

    return (
        <div className='row'>
            <div className='border-light' style={{minHeight:"450px"}}>
                <nav className='row animatedGradient sticky-top'>
                    <div className='container px-4'
                        key={_}>
                        <ul className='nav nav-tabs nav-fill fw-normal'
                            style={{padding:"4px 0px 0px 0px", borderBottom:"none", 
                                paddingTop:"15px", zIndex:"9999"}}>
                            <LanguageSelector/>
                            <h2 role="button" className={page==="dashboard" || location.pathname==="/" ?
                                    'px-3 nav-link fs-2 active user-select-none':
                                    'px-3 nav-link fs-2 user-select-none text-white'}
                                    style={{height:"41px"}}
                                    onClick={()=>{routeChange(""); setPage("dashboard");}}><div style={{margin:"-6px"}}>hrm</div></h2>
                            <li className='nav-item mx-1 clickable'>
                                <a className={page==="teams" || location.pathname==="/organization" ?
                                    'nav-link active':
                                    'nav-link text-white'}
                                onClick={()=>{routeChange("organization"); setPage("teams"); setGoToMyTeam(false);}}>{t('organizationMenuBar')}</a></li>

                            <li className='nav-item mx-1 clickable'>
                                <a className={page==="performance" || location.pathname==="/performance" ?
                                    'nav-link active':
                                    'nav-link text-white'}
                                onClick={()=>{routeChange("performance"); setPage("performance"); setGoToAdminPerf(false);}}>{t('performanceMenuBar')}</a></li>

                            <li className='nav-item mx-1 clickable'>
                                <a className={page==="salaries" || location.pathname==="/salaries" ?
                                    'nav-link active':
                                    'nav-link text-white'}
                                onClick={()=>{routeChange("salaries"); setPage("salaries"); setGoToAdminSal(false);}}>{t('salariesMenuBar')}</a></li>

                            <li className='nav-item mx-1 clickable'>
                                <a className={page==="leaves" || location.pathname==="/leaves" ?
                                    'nav-link active':
                                    'nav-link text-white'} 
                                onClick={()=>{routeChange("leaves"); setPage("leaves"); setGoToAdminDaysOff(false);}}>{t('leavesMenuBar')}</a></li>

                            {isAdmin && (<li className='nav-item mx-1 clickable'>
                                <a className={page==="reports" || location.pathname==="/reports" ?
                                    'nav-link active':
                                    'nav-link text-white'} 
                                onClick={()=>{routeChange("reports"); setPage("reports");}}><Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('reportsMenuBar')}</a></li>)}

                            {isAdmin && <li className='nav-item mx-1 clickable'>
                                <a className={page==="management" || location.pathname==="/accounts"  
                                    || page=== "userman" 
                                    || page=== "teamsMan"?
                                    'nav-link active':
                                    'nav-link text-white'} 
                                onClick={()=>{routeChange("accounts"); setPage("management");}}><Icon.UnlockFill size={15} style={{margin:"0px 3px 5px 0px"}}/>{t('accountsMenuBar')}</a>
                            </li>}
                            <li className='nav-item text-end' style={{margin:"-7px 0px -8px 4px"}}>
                                <div className="btn-group text-center" style={{height:"46px", paddingTop:"4px",
                                    marginTop:"3px",  width:"100%"}} onClick={() => {routeChange("profile"); setPage("profile");}}>
                                    <button type="button" 
                                        className={page==="profile" || location.pathname==="/profile" ?
                                            'nav-link p-0 active text-center':
                                            'nav-link p-0 text-center'}
                                            style={{borderBottom:"none", borderRadius: "6px 6px 0px 0px"}}>
                                        <div style={{margin:"1px auto 2px auto", width:"37px", height:"37px"}} 
                                            className='rounded-circle text-center'>
                                            {currentUser != null && (<Avatar size={"35px"} id={currentUser.id}/>)}
                                        </div>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
               <div className='container'>
                    <Routes>
                        <Route index path="/" element={<Dashboard/>}/>
                        <Route path="profile" element={<Profile/>}/>
                            {currentUser != null && (<>
                                <Route path="performance" element={<Performance permissions={currentUser.role} id={currentUser.id} currentUser={currentUser} goToAdminPerf={goToAdminPerf}/>}/>
                                <Route path="salaries" element={<Salaries permissions={currentUser.role} id={currentUser.id} goToAdminSal={goToAdminSal}/>}/>
                                <Route path="leaves" element={<Leaves permissions={currentUser.role} currentUser={currentUser} leaveDays={currentUser.leaveDays} goToAdminDaysOff={goToAdminDaysOff}/>}/>
                                <Route path="organization" element={<Organization goToMyTeam={goToMyTeam}/>}/>
                                <Route path="reports" element={<Reports permissions={currentUser.role} id={currentUser.id}/>}/>
                                <Route path="accounts" element={<Management permissions={currentUser.role}/>}/>
                            </>)}
                        <Route path="*" element={<Page404/>}/>
                    </Routes>
               </div>
            </div>
        </div>
    )
}
  
      
