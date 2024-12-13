import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { OrganizationChart } from 'primereact/organizationchart';
import axios from 'axios';
import Avatar from '../profile/Avatar';
import { useTranslation } from 'react-i18next'; 

export default function Organigram() {
   
  const [data, setData] = useState([{'expanded':true}]);
  const [updated, setUpdated] = useState(false);
  const { t } = useTranslation();

  const nodeTemplate = (node) => {
    return (
      <div className='border border-light rounded py-2 orgShadow bg-light'
        style={{minWidth:"150px"}}>
          <div className="node-content">
            <div className="mx-2 mb-2 px-2 rounded bg-primary-subtle fw-bold text-primary"><small>{node.jobTitle}</small></div>
            <div className='d-flex justify-content-center'><Avatar id={node.userId} size={"50px"}/></div>
            <div className='px-2'><small>{node.name}</small></div>
          </div> 
      </div>
    );
  }

  useEffect( () => {
    getOrganigram();
  },[])

  useEffect( () => {
    setUpdated(!updated);
  },[data])

  const getOrganigram = () => {
    axios.request({
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      method: "GET",
      url: `http://localhost:8082/users/organigram`
    }).then((responseAuth) => {
        setData(responseAuth.data);
    }).catch(function (error) {
        console.log(error.message)
        window.location.reload();
    });
  }

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current){
      const elWidth = ref.current.offsetWidth / 2;
      ref.current.scrollLeft = ref.current.scrollWidth / 2 - elWidth;
    }
  }, [ref.current, updated]);

  return (
    <div>
        <div className=''>
          <h5 className='fw-light text-secondary'>{t('organigramTitle')}</h5>
          <div key={updated} ref={ref} className="overflow-x-auto organigrama pt-4 pb-5">
              <OrganizationChart value={data} nodeTemplate={nodeTemplate}/>
          </div>
        </div>
    </div>
  );
}
