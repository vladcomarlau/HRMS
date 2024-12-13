import * as React from 'react';
import axios from 'axios';
import Calendar from 'rc-year-calendar';
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useReducer } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslation } from 'react-i18next';

export default function MyLeaves(props) {
    // PROPS
    // currentUser = user
    // leaveDays = currentUser.leaveDays
    // edit = bool
    // editingUser = bool
    const [currentUserId] = useState(props.currentUser.id);
    const [leaveDaysBalance, setLeaveDaysBalance] = useState(props.zile);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveBeginDate, setleaveBeginDate] = useState("");
    const [leaveEndDate, setLeaveEndDate] = useState("");
    const [sendLeaveBeginDate, setSendLeaveBeginDate] = useState("");
    const [sendLeaveEndDate, setSendLeaveEndDate] = useState("");
    const [leaveDays, setLeaveDays] = useState(0);
    const [leaveType, setLeaveType] = useState("CASUAL");
    const { t } = useTranslation();
    
    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const [showAddModal, setShowAddModal] = useState(false);
    
    useEffect(() => {
        fetchLeaves();
    },[])

    const dates = [
        {
            startDate: new Date(2024, 6, 17),
            endDate: new Date(2024, 6, 28),
            color:"#5282F5"
        },
        {
            startDate: new Date(2024, 5, 16),
            endDate: new Date(2024, 5, 19),
            color:"#f5527d"
        },
        {
            startDate: new Date(2024, 5, 22),
            endDate: new Date(2024, 5, 22),
            color:"#f5527d"
        }
    ]
    
    function workDays(startDate, endDate){
        if (endDate < startDate)
            return 0;
        
        var millisecondsPerDay = 86400 * 1000;
        startDate.setHours(0,0,0,1);
        endDate.setHours(23,59,59,999);
        var diff = endDate - startDate;
        var days = Math.ceil(diff / millisecondsPerDay);
        
        var weeks = Math.floor(days / 7);
        days = days - (weeks * 2); //scad 2 zile de weekend per saptamana
        
        var startDay = startDate.getDay();
        var endDay = endDate.getDay();
        
        if (startDay - endDay > 1) //daca am trecut de weekend il scad
            days = days - 2;      
        
        if (startDay == 0 && endDay != 6) {  //daca am trecut de o singura zi de weekend o scad
            days = days - 1;  
        }
        
        if (endDay == 6 && startDay != 0) {  //daca incep si termin cu zi de weekend le scad
            days = days - 1;
        }
        return days;
    }

    const parseMyDate = (myDate) => {
        const offset = myDate.getTimezoneOffset();
        let yourDate = new Date(myDate.getTime() - (offset*60*1000));
        return yourDate.toISOString().split('T')[0]
    }

    const sendLeave = (start, end) => {
        if(window.confirm(t('leavesConfirmAdd'))) {
            axios.request({
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                data: {
                    ownerUserId: currentUserId,
                    beginDate: parseMyDate(start),
                    endDate: parseMyDate(end),
                    workDaysDuration: workDays(start, end) == 0 ? 1 : workDays(start, end),
                    type: leaveType
                },
                method: "POST",
                url: `http://localhost:8082/leaves/${currentUserId}`
            }).then((response) => {
                if(response.data == t('leavesAddErrorNotEnoughDaysSYSTEM')) {
                    alert(t('leavesAddErrorNotEnoughDaysMessage'));
                }
                fetchLeaves();
                forceUpdate();
            }).catch(function (error) {
                console.log(error.message);
                localStorage.clear();
                window.location.reload();
            });
        }
    }

    const onRangeSelectedCallback = (start, end) => {
        setleaveBeginDate(parseMyDate(start));
        setLeaveEndDate(parseMyDate(end));
        setLeaveDays(workDays(start, end) === 0 ? 1 : workDays(start, end));
        setSendLeaveBeginDate(start);
        setSendLeaveEndDate(end);
        setShowAddModal(true);
    }

    const handleCloseAddModal = () => {
        sendLeave(sendLeaveBeginDate, sendLeaveEndDate);
        setShowAddModal(false);
    }

    const getColor = (leaveType, state) => {
        let color ="";
        switch (true) {
            case (leaveType == "CASUAL"):
                color = state == "APPROVED" ? "#91ff3d" : "#e5ffd5";
                break;
            case (leaveType == "PAID_HOLIDAY"):
                color = state == "APPROVED" ? "#ffdb66" : "#fdf5d7";
                break;
            case (leaveType == "UNPAID"):
                color = state == "APPROVED" ? "#b0aeae" : "#e8e8e8";
                break;
            case (leaveType == "SICK_LEAVE"):
                color = state == "APPROVED" ? "#fa395a" : "#f2cfd5";
                break;
            case (leaveType == "PATERNITY"):
                color = state == "APPROVED" ? "#6bd0ff" : "#daf1fc";
                break;
            case (leaveType == "MATERNITY"):
                color = state == "APPROVED" ? "#d980ff" : "#f0d4fc";
                break;
            case (leaveType == "TRAINING"):
                color = state == "APPROVED" ? "#8f75ff" : "#dad3fb";
                break;
        }
        return color;
    }

    const stareTemp = (rowData) => {
        if (rowData.leaveState === "PENDING") {
            return (<div className='bg-warning-subtle border border-warning-subtle rounded px-2 py-1'>{t('leavesPending')}</div>);
        } else if (rowData.leaveState === "APPROVED") {
            return (<div className='bg-success-subtle border border-success-subtle rounded px-2 py-1'>{t('leavesApproved')}</div>);
        } else if (rowData.leaveState === "REJECTED") {
            return (<div className='bg-danger-subtle border border-danger-subtle rounded px-2 py-1'>{t('leavesRejected')}</div>);
        }
    };

    const approverTemp = (rowData) => {
        if (rowData.approver.length > 0) {
            return (rowData.approver);
        } else {
            return "-";
        }
    };

    const durationTemp = (rowData) => {
        return (rowData.workDaysDuration + " " + t('days'));
    };

    const handleApprove = (leaveId, approveOrReject) => {
        if(window.confirm(`${t('leavesConfirmReject')} ${approveOrReject} ${t('theLeave')}`)) {
            axios.request({
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "text/plain"
                },
                data: props.editingUser != null && (props.editingUser.firstName + " " + props.editingUser.lastName),
                method: "PUT",
                url: `http://localhost:8082/leaves/${approveOrReject}/${leaveId}`
            }).then((response) => {
              if(response.data == t('leaveConfirmedSYSTEM')) {
                alert(t('leaveConfirmedMessage'));
              }
              if(response.data == t('leaveRejectedSYSTEM')) {
                alert(t('leaveRejectedMessage'));
              }
              fetchLeaves();
              forceUpdate();
            }).catch(function (error) {
                console.log(error.message);
                localStorage.clear();
                window.location.reload();
            });
        }
    }

    const approveTemp = (rowData) => {
        return (
            <div>
                {(rowData.leaveState === "PENDING" || rowData.leaveState === "APPROVED")
                && (<div className='btn btn-outline-danger mx-1' 
                    onClick={() => handleApprove(rowData.id, "reject")}>
                        {t('reject')}
                </div>)}
                {(rowData.leaveState === "PENDING")
                && (<div className='btn btn-outline-success mx-1' 
                    onClick={() => handleApprove(rowData.id, "approve")}>
                        {t('approve')}
                </div>)}
            </div>
        )
    }

    const fetchLeaves = () => {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/leaves/${currentUserId}`
        }).then((response) => {
          if(response.data.length != 0) {
            setLeaveDaysBalance(response.data.leaveDays);
            setLeaveRequests(response.data.leaves);
            let leavesTemp = response.data.leaves.map(c => {
                return{
                    startDate: new Date(c.beginDate),
                    endDate: new Date(c.endDate),
                    color: getColor(c.type, c.leaveState),
                    leaveState: c.leaveState,
                    approverName: c.approver
                }
            });
            let publicHolidays = response.data.publicHolidays.map(c => {
                return{
                    startDate: new Date(c.beginDate),
                    endDate: new Date(c.endDate),
                    color: getColor(c.type, "APPROVED"),
                    leaveState: "APPROVED",
                    approverName: c.approver
                }
            })
            leavesTemp.push(...publicHolidays);

            setLeaves(leavesTemp.filter((e) => {
                return e.leaveState != "REJECTED";
            }));
            setPendingLeaves(leavesTemp.filter((e) => {
                return e.leaveState === "PENDING";
            }));
          }
        }).catch(function (error) {
            console.log(error.message);
            localStorage.clear();
            window.location.reload();
        });
    }

    const leaveClasses = 'rounded fw-bold ps-2 py-1 my-2';

    const requestsTable = (
    <div className='alert alert-light'>
        <h5 className='fw-light mb-4' >{t('leaveRequestsOverview1')} {leaveRequests.length} {t('leaveRequestsOverview2')} {pendingLeaves.length} {t('leaveRequestsOverview3')}</h5>
        <DataTable value={leaveRequests} paginator rowsPerPageOptions={[5, 10, 25, 50]} rows={13}
            size='small' showGridlines stripedRows selectionMode="single" 
            sortField="id" sortOrder={-1}
            scrollable scrollHeight="353px" className='custom-sm-font' emptyMessage={t('noLeavesRequests')}>
            <Column field="id" header={t('id')} sortable style={{ minWidth: '20' }} frozen></Column>
            <Column field="beginDate" header={t('startDate')} sortable style={{ minWidth: '100px' }} frozen></Column>
            <Column field="endDate" header={t('endDate')} sortable style={{ minWidth: '100px' }} frozen></Column>
            <Column field="type" header={t('leaveType')} sortable style={{ minWidth: '40px'}} frozen></Column>
            <Column field="workDaysDuration" header={t('duration')} body={durationTemp} sortable style={{ minWidth: '30px' }} frozen></Column>
            <Column field="leaveState" header={t('state')} body={stareTemp} sortable style={{ minWidth: '30px' }} frozen></Column>
            {props.edit && (<Column field="" header={t('approveOrReject')} body={approveTemp} sortable style={{ minWidth: '30px' }} frozen></Column>)}
            <Column field="approver" header={t('approvedBy')} body={approverTemp} sortable style={{ minWidth: '130px' }} frozen></Column>
        </DataTable>
    </div>)

    return (
        <div>
            {props.edit && requestsTable}
            <div className=''>
                <h3 className='fw-lighter'><Icon.CalendarDateFill size={22} style={{marginBottom:'6px'}}/> {t('leavesCalendarTitle')}</h3><hr/>
                <div className='row'>
                    <div className='col-12 col-sm-12 col-md-3'>
                        <div className='alert alert-light'>
                            <h5 className='fw-light'>{t('availableLeaveDays')}</h5><hr/>
                            <div className='text-center fs-1 fw-lighter my-1'>
                                {leaveDaysBalance}
                            </div>
                        </div>
                        <div className='alert alert-light'>
                            <h5 className='fw-light'>{t('pendingLeaveDays')}</h5><hr></hr>
                            <div className='text-center fs-1 fw-lighter my-1'>
                                {pendingLeaves.length}
                            </div>
                        </div>
                        <div className='alert alert-light'>
                            <h5 className='fw-light'>{t('colorLegend')}</h5><hr/>
                            <div className='row'>
                                <div className='col-6'>
                                    {t('leavesPending')}
                                </div>
                                <div className='col-6 text-end'>
                                    {t('leavesApproved')}
                                </div>
                            </div>
                            <div className={leaveClasses + " casual"} style={{backgroundColor:"rgb(229,253,215)"}}>{t('leaveTypeCasual')}</div>
                            <div className={leaveClasses + " paid_holiday"} style={{backgroundColor:"rgb(253,245,215)"}}>{t('leaveTypePaidHoliday')}</div>
                            <div className={leaveClasses + " unpaid"} style={{backgroundColor:"rgb(207,207,207)"}}>{t('leaveTypeUnpaid')}</div>
                            <div className={leaveClasses + " sick_leave"} style={{backgroundColor:"rgb(242,207,213)"}}>{t('leaveTypeSick')}</div>
                            <div className={leaveClasses + " paternity"} style={{backgroundColor:"rgb(217,241,252)"}}>{t('leaveTypePaternity')}</div>
                            <div className={leaveClasses + " maternity"} style={{backgroundColor:"rgb(240,212,251)"}}>{t('leaveTypeMaternity')}</div>
                            <div className={leaveClasses + " training"} style={{backgroundColor:"rgb(218,211,251)"}}>{t('leaveTypeTraining')}</div>
                        </div>
                    </div>
                    <div className='col-12 col-sm-12 col-md-9'>
                        <Calendar
                        key={_}
                        language="en"
                        enableRangeSelection={true}
                        style="background"
                        allowOverlap={false}
                        weekStart={1}
                        disabledWeekDays={[0,6]}
                        dataSource={leaves}
                        displayDisabledDataSource={true}
                        onRangeSelected={(e) => onRangeSelectedCallback(e.startDate, e.endDate)}/>
                    </div>
                </div>
                <hr></hr>
            </div>
            {!props.edit && requestsTable}


            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="md">
                <Modal.Header closeButton>
                    <Modal.Title>{t('leaveRequestTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <div>
                        <div className='border alert'>
                            <h5 className=''>{t('startDate')}</h5>
                            {leaveBeginDate}
                        </div>
                        <div className='border alert'>
                            <h5 className=''>{t('endDate')}</h5>
                            {leaveEndDate}
                        </div>
                        <div className='border alert'>
                            <h5 className=''>{t('leaveAddDuration')}</h5>
                            {leaveDays} ({t('leaveDaysBalanceRemaining')} {leaveDaysBalance-leaveDays})
                        </div>
                        <div className='border alert'>
                            <h5 className=''>{t('leaveType')}</h5>
                            <select className='form-select' onChange={(e) => setLeaveType(e.target.value)} value={leaveType}>
                                <option value="CASUAL">{t('leaveTypeCasual')}</option>
                                <option value="UNPAID">{t('leaveTypeUnpaid')}</option>
                                <option value="SICK_LEAVE">{t('leaveTypeSick')}</option>
                                <option value="PATERNITY">{t('leaveTypePaternity')}</option>
                                <option value="MATERNITY">{t('leaveTypeMaternity')}</option>
                                <option value="TRAINING">{t('leaveTypeTraining')}</option>
                            </select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>{t('close')}</Button>
                    <Button variant="primary" onClick={handleCloseAddModal}>{t('sendRequest')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
