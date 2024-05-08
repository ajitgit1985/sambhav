import React, { useEffect, useState } from 'react';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { Link, useNavigate } from "react-router-dom";
import home_icon from '../assets/images/Home_icon.svg'

// const id = "02137f95-32c4-4cd0-bdec-51100b2abb4c";
const id = "ed1429d2-abbb-41d0-afd3-5907ba0ece12";


const ViewDashboard = () => {
  

  const navigate = useNavigate();
  const handleBackBtn = () => {
    navigate("/");
  };
  const [guestToken, setGuestToken] = useState(null);

  useEffect(() => {
    const fetchGuestTokenFromBackend = async () => {
      const params = new URLSearchParams({
        username: 'admin',
        password: '@@dm1n',
        iframe_user: 'iframe',
        first_name: 'Yashi',
        last_name: 'iframe',
        // id: '02137f95-32c4-4cd0-bdec-51100b2abb4c'
        id: 'ed1429d2-abbb-41d0-afd3-5907ba0ece12'
      });

      // const response = await fetch(`http://localhost:8088/api/guest_token?${params.toString()}`); // local
      const response = await fetch(`http://10.194.83.67/api/guest_token?${params.toString()}`);
      const data = await response.json();
      // alert(data.guestToken)
      return data.guestToken;
    };

    const embedDashboardWithToken = async () => {
      const token = await fetchGuestTokenFromBackend();
     
      embedDashboard({
        id: 'ed1429d2-abbb-41d0-afd3-5907ba0ece12',
        // id: "02137f95-32c4-4cd0-bdec-51100b2abb4c", 
        supersetDomain: "http://10.194.83.67",
        mountPoint: document.getElementById("my-superset-container"),
        fetchGuestToken: () => token,
        dashboardUiConfig: {
          hideTitle: false,
          filters: {
            expanded: false,
          },
          urlParams: {}
        },
      });
    };

    embedDashboardWithToken();
  }, []);

  return (
    <>
    <div className="App">
          <div className="back_container">
            <Link className="btn_back" to="/" onClick={() => handleBackBtn()}><img src={home_icon} /></Link>
          </div>
          <div id="my-superset-container"></div>;
       </div>
    </>    
  );
  
};

export { id };
export default ViewDashboard;

