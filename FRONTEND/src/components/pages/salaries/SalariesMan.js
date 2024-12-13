import * as React from 'react';
import * as Icon from 'react-bootstrap-icons';
import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import { Chart } from 'primereact/chart';
import Button from 'react-bootstrap/Button';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace';
import { MeterGroup } from 'primereact/metergroup';
import { useTranslation } from 'react-i18next';

export default function SalariesMan() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [variableNames] = useState([
    t('salaryPackageSearchTotal'), 
    t('salaryPackageSearchHeaderBase'), 
    t('salaryPackageSearchHeaderPerformance'), 
    t('salaryPackageSearchHeaderProject'), 
    t('salaryPackageSearchHeaderMeal'), 
    t('salaryPackageSearchHeaderInsurance'), 
    t('salaryPackageSearchHeaderBenefits')  
  ]);
  const [totalSalaries, setTotalSalaries] = useState([0,0,0,0,0,0,0,0]);
  const [values, setValues] = useState([]);

  const [showSalariesModal, setShowSalariesModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userIdEdit, setUserIdEdit] = useState(null);

  const [averageSalary, setAverageSalary] = useState(0);

  
  
  const [salaries] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            data: [1, 1, 1, 1, 2, 2, 3],
        },
        {
            data: [1, 1, 1, 1, 2, 2, 3]
        }
      ]
  });

  const [salariesMatrix, setSalariesMatrix] = useState([]);
  
  const handleCloseSalariesModal = () => {
    getSalariesAccounts();
    setShowSalariesModal(false);
  }
  
  const [date, setDate] = useState(new Date());
  const [base, setBase] = useState(0);
  const [bonusPerf, setBonusPerf] = useState(0);
  const [bonusProj, setBonusProj] = useState(0);
  const [mealTickets, setMealTickets] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [benefits, setBenefits] = useState(0);

  useEffect(() => {
    getSalariesAccounts();
  },[])

  const getSalariesAccounts = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/salaries/users`
    }).then((response) => {
      response.data.map(function(a) {
        a.fullName = a.firstName + " " + a.lastName;
        
        if(a.salaries.length > 0) {
          a.currentSalary = a.salaries[a.salaries.length-1];
        } else {
          a.currentSalary = [];
        }
        
        return a;
      })

      let total = 0;
      let totalBase = 0;
      let totalBonusPerf = 0;
      let totalBonusProj = 0;
      let totalMealTickets = 0;
      let totalInsurance = 0;
      let totalBenefits = 0;

      if(response.data.length > 0) {
        let avgSal = 0;
        let countAverageSalary = 0
        for(let i = 0; i < response.data.length; i++) {
          let totalUser = 0;
          if(response.data[i].salaries.length > 0) {
            totalUser = response.data[i].salaries[response.data[i].salaries.length-1].total;
            totalBase += response.data[i].salaries[response.data[i].salaries.length-1].base
            totalBonusPerf += response.data[i].salaries[response.data[i].salaries.length-1].performanceBonus;
            totalBonusProj += response.data[i].salaries[response.data[i].salaries.length-1].projectBonus;
            totalMealTickets += response.data[i].salaries[response.data[i].salaries.length-1].mealTickets;
            totalInsurance += response.data[i].salaries[response.data[i].salaries.length-1].lifeInsurance;
            totalBenefits += response.data[i].salaries[response.data[i].salaries.length-1].subscriptions;
            avgSal += totalUser
            countAverageSalary++;
          }
          total += totalUser;
        }
        if(averageSalary != "-infinity" && averageSalary != "infinity" && countAverageSalary > 0) {
          setAverageSalary(avgSal/countAverageSalary)
        }
      }
      setTotalSalaries([total, totalBase,
        totalBonusPerf, totalBonusProj,
        totalMealTickets, totalInsurance,
        totalBenefits
      ])
      
      setValues ([
        { label: t('salaryPackageSearchHeaderBase'), color: '#6434e9', value: Math.ceil(totalBase/total*100), icon: 'pi pi-circle-fill' },
        { label: t('salaryPackageSearchHeaderPerformance'), color: '#2c7ce5', value: Math.ceil(totalBonusPerf/total*100), icon: 'pi pi-circle-fill' },
        { label: t('salaryPackageSearchHeaderProject'), color: '#49cc5c', value: Math.ceil(totalBonusProj/total*100), icon: 'pi pi-circle-fill' },
        { label: t('salaryPackageSearchHeaderMeal'), color: '#f8c421', value: Math.ceil(totalMealTickets/total*100), icon: 'pi pi-circle-fill' },
        { label: t('salaryPackageSearchHeaderInsurance'), color: '#fb6640', value: Math.ceil(totalInsurance/total*100), icon: 'pi pi-circle-fill' },
        { label: t('salaryPackageSearchHeaderBenefits'), color: '#f82553', value: Math.ceil(totalBenefits/total*100), icon: 'pi pi-circle-fill' }
      ]);

      setUsers(response.data);
      setUpdated(!updated);
    }).catch(function (error) {
      console.log(error.message);
      localStorage.clear();
      window.location.reload();
    });
  }

  const totalTemp = (rowData) => {
    if (rowData.currentSalary.total != undefined) {
      return `${formatCurrency(rowData.currentSalary.total)}`;
    } else {
      return "-";
    }
  };

  const baseTemp = (rowData) => {
    if (rowData.currentSalary.base != undefined) {
      return `${formatCurrency(rowData.currentSalary.base)}`;
    } else {
      return "-";
    }
  };

  const bonusPerfTemp = (rowData) => {
    if (rowData.currentSalary.performanceBonus != undefined) {
      return `${formatCurrency(rowData.currentSalary.performanceBonus)}`;
    } else {
      return "-";
    }
  };

  const bonusProjTemp = (rowData) => {
    if (rowData.currentSalary.projectBonus != undefined) {
      return `${formatCurrency(rowData.currentSalary.projectBonus)}`;
    } else {
      return "-";
    }
  };

  const mealTicketsTemp = (rowData) => {
    if (rowData.currentSalary.mealTickets != undefined) {
      return `${formatCurrency(rowData.currentSalary.mealTickets)}`;
    } else {
      return "-";
    }
  };

  const insuranceTemp = (rowData) => {
    if (rowData.currentSalary.lifeInsurance != undefined) {
      return `${formatCurrency(rowData.currentSalary.lifeInsurance)}`;
    } else {
      return "-";
    }
  };

  const benefitsTemp = (rowData) => {
    if (rowData.currentSalary.subscriptions != undefined) {
      return `${formatCurrency(rowData.currentSalary.subscriptions)}`;
    } else {
      return "-";
    }
  };

  const formatCurrency = (value) => {
      return value.toLocaleString('ro-RO', { style: 'currency', currency: 'ron' });
  };

  const searchFilter = (oldRow) => {
    if(oldRow != null && searchInput.length > 0){
      const {manager, avatar, subordinates, ...row} = oldRow;
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
                  placeholder={t('salaryPackageSearchPlaceholder')} onChange={handleSearchInput}/>
          </div>
      </div>
    </div>
  )

  const editTemplate = (rowData) => {
    return <small className='btn btn-sm btn-outline-dark border-0 d-flex justify-content-center'
      style={{marginRight:"-7px"}}
      onClick={() => handleShowSalariesModal(rowData)}><Icon.Pen/></small> 
  };

  const deleteTemplate = (rowData) => {
    return <small className='btn btn-sm btn-outline-danger border-0 d-flex justify-content-center'
      style={{margin:"0px"}}
      onClick={() => handleDelete(rowData.user, rowData.index)}><Icon.Trash3/></small> 
  };

  const handleShowSalariesModal = (row) => {
    setShowSalariesModal(true);
    setSelectedUser(row);
    getSalaries(row.id);
  }

  const handleDelete = (userId, salaryIndex) => {
    if(window.confirm(t('salaryDeleteConfirm'))) {
      axios.request({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        method: "DELETE",
        url: `http://localhost:8082/salaries/${userId}/${salaryIndex}`
      }).then((response) => {
        getSalaries(userId);
        setUpdated(!updated);
      }).catch(function (error) {
        console.log(error.message);
        localStorage.clear();
        window.location.reload();
      });
    }
  }

  const getSalaries = (id) => {
    setUserIdEdit(id)
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/salaries/map/${id}`
    }).then((responseAuth) => {
        let matSalaries = []
        for(let i=0; i < responseAuth.data.labels.length; i++) {
          matSalaries.push({
            user: id,
            index: i,
            date: responseAuth.data.labels[i],
            bonusPerf: responseAuth.data.datasets[0].data[i],
            bonusProj: responseAuth.data.datasets[1].data[i],
            mealTickets: responseAuth.data.datasets[2].data[i],
            insurance: responseAuth.data.datasets[3].data[i],
            base: responseAuth.data.datasets[4].data[i],
            benefits: responseAuth.data.datasets[5].data[i],
            total: responseAuth.data.datasets[6].data[i]
          })
        }
        setSalariesMatrix(matSalaries)
        let total = 0;
        if(matSalaries.length > 0) {
          let arrLabels = responseAuth.data.datasets.map(function (a) {return a.label})
          arrLabels = arrLabels.slice(0, arrLabels.length-1)
          let arrSalary = Object.values(matSalaries[matSalaries.length-1]);
          total = arrSalary[arrSalary.length-1];
          arrSalary = arrSalary.slice(1,7).map( function(a) {return Math.trunc(a/total*100)});
        }
        setUpdated(!updated);
    }).catch(function (error) {
        console.log(error.message);
        localStorage.clear();
        window.location.reload();
    });
  }

  const totalSalariesTemp = (rowData) => {
    if (rowData.total != undefined) {
      return `${formatCurrency(rowData.total)}`;
    }
  };

  const baseSalariesTemp = (rowData) => {
    if (rowData.base != undefined) {
      return `${formatCurrency(rowData.base)}`;
    }
  };

  const bonusPerfSalariesTemp = (rowData) => {
    if (rowData.bonusPerf != undefined) {
      return `${formatCurrency(rowData.bonusPerf)}`;
    }
  };

  const bonusProjSalariesTemp = (rowData) => {
    if (rowData.bonusProj != undefined) {
      return `${formatCurrency(rowData.bonusProj)}`;
    }
  };

  const mealTicketsSalariesTemp = (rowData) => {
    if (rowData.mealTickets != undefined) {
      return `${formatCurrency(rowData.mealTickets)}`;
    }
  };

  const insuranceSalariesTemp = (rowData) => {
    if (rowData.insurance != undefined) {
      return `${formatCurrency(rowData.insurance)}`;
    }
  };

  const benefitsSalariesTemp = (rowData) => {
    if (rowData.benefits != undefined) {
      return `${formatCurrency(rowData.benefits)}`;
    }
  };

  const resetPachet = () => {
    setDate(new Date());
    setBase(0);
    setBonusPerf(0);
    setBonusProj(0);
    setMealTickets(0);
    setInsurance(0);
    setBenefits(0);
  }

  const handleAddSalary = () => {
    resetPachet();
    if(window.confirm(t('confirmNewSalary'))) {
      if(!userIdEdit) {
        alert(t('errorSalaryMissingAccount'));
      } else {
        if(!(!date || date.length == 0 || date == null)) {
          const offset = date.getTimezoneOffset();
          let yourDate = new Date(date.getTime() - (offset*60*1000));
          let parsedDate = yourDate.toISOString().split('T')[0];
          axios.request({
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            data: 
              {
                "date": parsedDate,
                "base": base,
                "performanceBonus": bonusPerf,
                "projectBonus": bonusProj,
                "mealTickets": mealTickets,
                "lifeInsurance": insurance,
                "subscriptions": benefits
              },
            method: "POST",
            url: `http://localhost:8082/salaries/${userIdEdit}`
          }).then((response) => {
            alert(t('successNewSalary'));
            getSalaries(userIdEdit);
            setUpdated(!updated);
          }).catch(function (error) {
            alert(t('errorNewSalary'));
            console.log(error.message);
            window.location.reload();
          });
        } else {
          alert(t('errorNewSalaryMissingDate'));
        }
      }
    }
  };

  const headerGroup = (
    <ColumnGroup>
        <Row>
          <Column header="" colSpan={4} />
          <Column header={t('salaryPackageSearchTitle')} colSpan={7} />
        </Row>
        <Row>
          <Column field="id" header={t('salaryPackageSearchID')} rowSpan={2} sortable frozen></Column>
          <Column field="fullName" header={t('salaryPackageSearchFullName')} rowSpan={2} sortable frozen></Column>
          <Column header={t('salaryPackageSearchModifySalary')} frozen></Column>
          <Column field="currentSalary.total" header={t('salaryPackageSearchTotal')} sortable/>
          <Column field="currentSalary.base" header={t('salaryPackageSearchHeaderBase')} sortable/>
          <Column field="currentSalary.performanceBonus" header={t('salaryPackageSearchHeaderPerformance')} sortable></Column>
          <Column field="currentSalary.projectBonus" header={t('salaryPackageSearchHeaderProject')} sortable></Column>
          <Column field="currentSalary.mealTickets" header={t('salaryPackageSearchHeaderMeal')} sortable></Column>
          <Column field="currentSalary.lifeInsurance" header={t('salaryPackageSearchHeaderInsurance')} sortable></Column>
          <Column field="currentSalary.subscriptions" header={t('salaryPackageSearchHeaderBenefits')} sortable></Column>
        </Row>
    </ColumnGroup>
  );

  return (
    <div>
      <div className='p-0'>
        <h3 className='fw-lighter'><Icon.Bank size={22} style={{marginBottom:'4px', marginRight:'4px'}}/><Icon.Gear size={22} style={{marginBottom:'4px'}}/> {t('salaryAdminTitle')}</h3><hr/>
        <div className='row'>
        <div className='col-md-4'>
            <div className='alert alert-light'>
              <h5 className='fw-light custom-sm-font'><Icon.InfoCircleFill className='mx-1'/> {t('salaryAdminMostExpensivePackageDescription')}</h5>
                <div className='fw-bold custom-sm-font'>{variableNames[totalSalaries.indexOf(Math.max(...totalSalaries.slice(2)))]}</div>
                <div className='custom-sm-font text-secondary'>{formatCurrency(Math.max(...totalSalaries.slice(2)))}</div>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='alert alert-light '>
              <h5 className='fw-light custom-sm-font'><Icon.InfoCircleFill className='mx-1'/> {t('salaryAdminTotalSpendingDescription')}</h5>
              <div className='fw-bold custom-sm-font'>{formatCurrency(totalSalaries[0])}</div><br></br>
            </div>
          </div>
          <div className='col-md-4'>
            <div className='alert alert-light'>
              <h5 className='fw-light custom-sm-font'><Icon.InfoCircleFill className='mx-1'/> {t('salaryAdminAverageSalaryDescription')}</h5>
              <div className='fw-bold custom-sm-font'>{formatCurrency(averageSalary)}</div><br></br>
            </div>
          </div>
        </div>

        <div className="alert alert-light text-center">
          <div className='fw-light fs-5 text-start mb-2'>{t('salaryExpensesOrganizationTitle')}</div>
          <MeterGroup values={values} className='custom-sm-font'/>
        </div>

        <h5 className='fw-light mt-1'>{t('salaryPackageManagementTitle')}</h5>
        
        <div className='text-secondary alert alert-light'>
        {t('salaryPackageSearchTotalAccounts')}: {users.length}
          {search}
          {searchInput.length > 0 && 
            <div className='mt-3'>
              {t('salaryPackageSearchResults')}: {filteredUsers.length}
            </div>}
        </div>
        <div className='alert alert-light p-1'>
          <DataTable key={updated} value={filteredUsers} headerColumnGroup={headerGroup}
            tableStyle={{ minWidth: '50rem' }}
            className='custom-sm-font'
            scrollable scrollHeight='700px' stripedRows selectionMode='single' size='small'
            sortField="id" sortOrder={-1} paginator rowsPerPageOptions={[5, 10, 25, 50]} rows={13} 
            emptyMessage={t('salaryPackageSearchNoResults')}>
            <Column field="id" header={t('salaryPackageSearchID')} frozen></Column>
            <Column field="fullName" header={t('salaryPackageSearchFullName')} style={{ minWidth: '170px' }} frozen></Column>
            <Column style={{ minWidth: '10px' }} footer={t('salaryPackageSearchTotal')} body={editTemplate} frozen></Column>
            <Column field="currentSalary.total" header={t('salaryPackageSearchTotal')} footer={formatCurrency(totalSalaries[0])} style={{ minWidth: '110px' }} body={totalTemp}></Column>
            <Column field="currentSalary.base" header={t('salaryPackageSearchHeaderBase')} footer={formatCurrency(totalSalaries[1])}  style={{ minWidth: '110px' }} body={baseTemp}></Column>
            <Column field="currentSalary.bonusPerformanta" header={t('salaryPackageSearchHeaderPerformance')} footer={formatCurrency(totalSalaries[2])}  style={{ minWidth: '110px' }} body={bonusPerfTemp}></Column>
            <Column field="currentSalary.bonusProiect" header={t('salaryPackageSearchHeaderProject')} footer={formatCurrency(totalSalaries[3])}  style={{ minWidth: '110px' }} body={bonusProjTemp}></Column>
            <Column field="currentSalary.mealTicketsMasa" header={t('salaryPackageSearchHeaderMeal')} footer={formatCurrency(totalSalaries[4])}  style={{ minWidth: '110px' }} body={mealTicketsTemp}></Column>
            <Column field="currentSalary.insuranceViata" header={t('salaryPackageSearchHeaderInsurance')} footer={formatCurrency(totalSalaries[5])}  style={{ minWidth: '110px' }} body={insuranceTemp}></Column>
            <Column field="currentSalary.abonamente" header={t('salaryPackageSearchHeaderBenefits')} footer={formatCurrency(totalSalaries[6])}  style={{ minWidth: '110px' }} body={benefitsTemp}></Column>
          </DataTable>
        </div>
      </div>

      <Modal show={showSalariesModal} onHide={handleCloseSalariesModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('salaryModifyPackageTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body >
            <div className='p-3'>
              <div>{t('selectedAccount')}:</div>
              <div className='table-responsive'>
                <table className='table table-sm table-hover'>
                  <thead>
                    <tr className='text-center' style={{whiteSpace: "nowrap"}}>
                      <th scope='col'></th>
                      <th scope='col'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser != null && (
                    <>
                      <tr style={{whiteSpace: "nowrap"}}>
                        <th scope='row'><small>{t('salaryPackageSearchID')}</small></th>
                        <td scope='row'><small>{selectedUser.id}</small></td>
                      </tr>
                      <tr style={{whiteSpace: "nowrap"}}>
                        <th scope='row'><small>{t('email')}</small></th>
                        <td scope='row'><small>{selectedUser.email}</small></td>
                      </tr>
                      <tr style={{whiteSpace: "nowrap"}}>
                        <th scope='row'><small>{t('lastName')}</small></th>
                        <td scope='row'><small>{selectedUser.lastName}</small></td>
                      </tr>
                      <tr style={{whiteSpace: "nowrap"}}>
                        <th scope='row'><small>{t('firstName')}</small></th>
                        <td scope='row'><small>{selectedUser.firstName}</small></td>
                      </tr>
                      <tr style={{whiteSpace: "nowrap"}}>
                        <th scope='row'><small>{t('jobTitle')}</small></th>
                        <td scope='row'><small>{selectedUser.jobTitle}</small></td>
                      </tr>
                    </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className='alert alert-light'>
                <Inplace>
                  <InplaceDisplay>{
                    <a className='btn btn-primary my-2'>{t('setNewSalaryButton')}</a>
                  }</InplaceDisplay>
                  <InplaceContent>
                      <h4>{t('newSalaryTitle')}</h4><hr></hr>
                      <div className='row m-2'>{t('salaryDate')}:<div>
                      <Calendar value={date} onChange={(e) => setDate(e.value)} touchUI/></div></div>
                      <div className='row m-2'>
                        <div className='col-lg-6'>
                          {t('salaryPackageSearchHeaderBase')}:<InputNumber value={base} onChange={(e) => setBase(e.value)} min={0} mode="currency" currency="RON" locale="ro-RO" decimalPlaces="0"></InputNumber>
                        </div>
                        <div className='col-lg-6'>
                          {t('salaryPackageSearchHeaderPerformance')}:<InputNumber value={bonusPerf} onChange={(e) => setBonusPerf(e.value)} min={0} mode="currency" currency="RON" locale="ro-RO"></InputNumber>
                        </div>
                      </div>
                      <div className='row m-2'>
                        <div className='col-lg-6'>
                          {t('salaryPackageSearchHeaderProject')}:<InputNumber value={bonusProj} onChange={(e) => setBonusProj(e.value)} min={0} mode="currency" currency="RON" locale="ro-RO"></InputNumber>
                        </div>
                        <div className='col-lg-6'>
                          {t('salaryPackageSearchHeaderMeal')}:<InputNumber value={mealTickets} onChange={(e) => setMealTickets(e.value)} min={0} mode="currency" currency="RON" locale="ro-RO"></InputNumber>
                        </div>
                      </div>
                      <div className='row m-2'>
                        <div className='col-lg-6'>
                          {t('salaryPackageSearchHeaderInsurance')}:<InputNumber value={insurance} onChange={(e) => setInsurance(e.value)} min={0} mode="currency" currency="RON" locale="ro-RO"></InputNumber>
                        </div>
                        <div className='col-lg-6'>
                          {t('salaryPackageSearchHeaderBenefits')}:<InputNumber value={benefits} onChange={(e) => setBenefits(e.value)} min={0} mode="currency" currency="RON" locale="ro-RO"></InputNumber>
                        </div>
                        <div className='row'>
                          <a className='btn btn-primary m-2 mt-4 col-4' onClick={handleAddSalary}>{t('setNewSalaryButton')}</a>
                        </div>
                    </div>
                  </InplaceContent>
                </Inplace>
              </div>
              <div className='alert alert-light'>
                <h4 className='fw-lighter text-start'>{t('modifySalaryHistoryTitle')}</h4>
                <DataTable value={salariesMatrix} size='small' showGridlines stripedRows
                  selectionMode="single" scrollable scrollHeight="353px" className='custom-sm-font'
                  emptyMessage={t('salaryPackageSearchNoResults')} sortField="date" sortOrder={-1}>
                  <Column field="date" header={t('date')} sortable style={{ minWidth: '102px' }} frozen></Column>
                  <Column field="" style={{ minWidth: '50px' }} frozen body={deleteTemplate}></Column>
                  <Column field="total" header={t('total')} sortable style={{ minWidth: '130px' }} body={totalSalariesTemp}></Column>
                  <Column field="base" header={t('salaryPackageSearchHeaderBase')} sortable style={{ minWidth: '130px' }} body={baseSalariesTemp}></Column>
                  <Column field="bonusPerf" header={t('salaryPackageSearchHeaderPerformance')} sortable style={{ minWidth: '130px' }} body={bonusPerfSalariesTemp}></Column>
                  <Column field="bonusProj" header={t('salaryPackageSearchHeaderProject')} sortable style={{ minWidth: '130px' }} body={bonusProjSalariesTemp}></Column>
                  <Column field="mealTickets" header={t('salaryPackageSearchHeaderMeal')} sortable style={{ minWidth: '130px' }} body={mealTicketsSalariesTemp}></Column>
                  <Column field="insurance" header={t('salaryPackageSearchHeaderInsurance')} sortable style={{ minWidth: '130px' }} body={insuranceSalariesTemp}></Column>
                  <Column field="benefits" header={t('salaryPackageSearchHeaderBenefits')} sortable style={{ minWidth: '130px' }} body={benefitsSalariesTemp}></Column>
                </DataTable>
              </div>
              {salaries != undefined && salaries.length > 0 && (
              <div className='alert alert-light'>
                <h4 className='fw-lighter text-start'>{t('salaryOverTimeTitle')}</h4>
                  <Chart type="line" data={salaries} style={{height:"300px"}} options={{
                  maintainAspectRatio: false
                }}/>
              </div>)}
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSalariesModal}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>    
  );
}
