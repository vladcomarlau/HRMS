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

export default function PublicHolidaysAdmin(props) {
// PROPS
// currentUser = user
// edit = true
// editingUser = user
    const [leaves, setLeaves] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveStartDate, setLeaveStartDate] = useState("");
    const [leaveEndDate, setLeaveEndDate] = useState("");
    const [sendLeaveStartDate, setSendLeaveStartDate] = useState("");
    const [sendLeaveEndDate, setSendLeaveEndDate] = useState("");
    const [leaveDays, setLeaveDays] = useState(0);
    const { t } = useTranslation();

    const [_, forceUpdate] = useReducer(x => x + 1, 0);

    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchHolidays();
    }, []);

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

    useEffect(() => {
        forceUpdate();
    }, [leaves])
    
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

    const sendHoliday = (start, end) => {
        if(window.confirm(t('holidayAddConfirm'))) {
            axios.request({
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                data: {
                    beginDate: parseMyDate(start),
                    endDate: parseMyDate(end),
                    workDaysDuration: workDays(start, end) == 0 ? 1 : workDays(start, end),
                    type: "PAID_HOLIDAY",
                    approver: props.currentUser.firstName + " " + props.currentUser.lastName
                },
                method: "POST",
                url: `http://localhost:8082/publicHolidays`
            }).then((response) => {
                fetchHolidays();
                forceUpdate();
            }).catch(function (error) {
                console.log(error.message);
                localStorage.clear();
                window.location.reload();
            });
        }
    }

    const onRangeSelectedCallback = (start, end) => {
        setLeaveStartDate(parseMyDate(start));
        setLeaveEndDate(parseMyDate(end));
        setLeaveDays(workDays(start, end) === 0 ? 1 : workDays(start, end));
        setSendLeaveStartDate(start);
        setSendLeaveEndDate(end);
        setShowAddModal(true);
    }

    const handleCloseAddModal = () => {
        sendHoliday(sendLeaveStartDate, sendLeaveEndDate);
        setShowAddModal(false);
    }

    const approverTemp = (rowData) => {
        if (rowData.approver != null && rowData.approver.length > 0) {
            return (rowData.approver);
        } else {
            return "-";
        }
    };

    const removeTemp = (rowData) => {
        return <small className='btn btn-sm btn-outline-danger border-0 d-flex justify-content-center'
            style={{margin:"0px"}}
            onClick={() => handleRemoveHoliday(rowData.beginDate, rowData.endDate)}><Icon.Trash3/></small>
    };

    const handleRemoveHoliday = (begin, end) => {
        if(window.confirm(t('holidayDeleteConfirm') + ` ${begin}  ->  ${end} ?`)) {
            removePublicHoliday(begin);
        }
    }

    const removePublicHoliday = (begin) => {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "DELETE",
            url: `http://localhost:8082/publicHolidays/${begin}`
        }).then((response) => {
            fetchHolidays();
        }).catch(function (error) {
            fetchHolidays();
            console.log(error.message);
            alert(t('holidayDeleteError'));
        })
    }

    const durataTemp = (rowData) => {
        return (rowData.workDaysDuration + (rowData.workDaysDuration > 1 ? " "+t("days") : " " + t("day")))
    };

    const fetchHolidays = () => {
        axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            method: "GET",
            url: `http://localhost:8082/publicHolidays`
        }).then((response) => {
            setLeaveRequests(response.data);
            let leavesTemp = response.data.map(c => {
                return{
                    startDate: new Date(c.beginDate),
                    endDate: new Date(c.endDate),
                    color: "#ffdb66",
                    numeAprobator: c.approver
                }
            });
            setLeaves(leavesTemp);
        }).catch(function (error) {
            console.log(error.message);
            localStorage.clear();
            window.location.reload();
        });
    }

    const leaveRequestsTable = (
    <div className='alert alert-light'>
        <h5 className='fw-light mb-4'>{t('holdidayRegisteredTitle')}: {leaveRequests.length}</h5>
        <DataTable 
            key={_}
            value={leaveRequests} 
            paginator rowsPerPageOptions={[5, 10, 25, 50]} rows={13}
            size='small' showGridlines stripedRows selectionMode="single"
            sortField="begin" sortOrder={-1}
            scrollable scrollHeight="353px" className='custom-sm-font' emptyMessage={t('noHolidays')}>
            <Column field="beginDate" header={t('startDate')} sortable style={{ minWidth: '100px' }} frozen></Column>
            <Column field="endDate" header={t('endDate')} sortable style={{ minWidth: '100px' }} frozen></Column>
            <Column field="workDaysDuration" header={t('duration')} body={durataTemp} sortable style={{ minWidth: '30px' }}></Column>
            <Column field="approver" header={t('submittedBy')} body={approverTemp} sortable style={{ minWidth: '130px' }}></Column>
            <Column header={t('remove')} body={removeTemp} sortable style={{ minWidth: '30px' }}></Column>
        </DataTable>
    </div>)

    return (
        <div>
            {props.edit && leaveRequestsTable}
            <div className=''>
                <h3 className='fw-lighter'><Icon.CalendarDateFill size={22} style={{marginBottom:'6px'}}/> {t('holidaysManagementTitle')}</h3><hr/>
                <h5 className='fw-light text-secondary'>{t('holidaysManagementDescription')}</h5>
                <div className='row'>
                    <div className=''>
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
            {!props.edit && leaveRequestsTable}

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="md">
                <Modal.Header closeButton>
                    <Modal.Title>{t('newHolidayModalTitle')}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    <div>
                        <div className='border alert'>
                            <h5 className=''>{t('startDate')}</h5>
                            {leaveStartDate}
                        </div>
                        <div className='border alert'>
                            <h5 className=''>{t('endDate')}</h5>
                            {leaveEndDate}
                        </div>
                        <div className='border alert'>
                            <h5 className=''>{t('holidayAddDuration')}</h5>
                            {leaveDays} {t('dayDays')}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>{t('close')}</Button>
                    <Button variant="primary" onClick={handleCloseAddModal}>{t('holidayAddButton')}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
