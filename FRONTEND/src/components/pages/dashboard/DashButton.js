import * as React from 'react';
import * as Icon from 'react-bootstrap-icons';

export default function DashButton(props) {
  return (
    <div className='btn alert btn-outline-light m-1 border col-xl-2 col-lg-4 col-md-5 col-sm-5 col-xs-12'
        style={{height:"220px"}}
        onClick={props.onClick}>
        {props.unlocked && (
          <div
            className='position-absolute'>
            <Icon.Unlock size={20}/>
          </div>
        )}
        <div className='fw-light fs-4 w-100 text-center position-absolute top-50 start-50 translate-middle'>
            <div>{props.icon}</div>
            <div className='px-2'>{props.text}</div>
            <small className='text-black-50 fs-6'>{props.subText}</small>
        </div>
    </div>
  );
}