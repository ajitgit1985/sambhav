import React, { useState, useEffect } from "react";
import bg_img from "../assets/images/6379115-01.svg";
import { useNavigate, useParams } from "react-router-dom";
import { id as myComponentId } from "./viewDashboard";
import View_icon from "../assets/images/view_icon.svg";
import Filters from "../components/extra/filters";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";

const Dashboard = () => {
    const navigate = useNavigate();
    const handleViewClick = () => {
        navigate(`/superset/dashboard/${myComponentId}`);
    };
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logoMapping, setLogoMapping] = useState({});
    const { sectorCode, ministryCode, stateCode,  } = useParams();

    const formatDate = (dateString) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date(dateString);
        const day = date.getDate() - 1;
        const month = date.getMonth(); 
        // const month = date.getMonth() + 1;
        return `${day < 10 ? '0' : ''}${day} ${months[month]}`;
    };

    const formatFrequency = (data_freq) => {
        return data_freq.charAt();
    };

    const formatGranularity = (granularity) => {
        return granularity.split('->')[0];
    };

    const formatUnit = (KPIUnit) => 
    {
        if (KPIUnit === 'Thousands'|| KPIUnit === 'Thousand')
            return KPIUnit.substring(0, 2);
        else if (KPIUnit === 'Crores'|| KPIUnit === 'Crore')
            return KPIUnit.substring(0, 2);
        else if (KPIUnit === 'Lakhs'|| KPIUnit === 'Lakh' || KPIUnit === 'Lacs'|| KPIUnit === 'Lac')
            return KPIUnit.substring(0, 2);
        else
            return KPIUnit; 
    };

    const formatValue = (KPIValue) => {
        if (KPIValue === '' || KPIValue === null)
            return 0; 
        else
            return KPIValue; 
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                let apiUrl;

                if (sectorCode) {
                    apiUrl = `http://10.25.53.135:3001?sectorCode=${sectorCode}`;
                    // console.log("Sector Code:", sectorCode); // Add label "Sector Code:"
                }else if (ministryCode) {
                    apiUrl = `http://10.25.53.135:3001/ministries?ministryid=${ministryCode}`;
                    alert("ministry Code:", ministryCode); // Add label "State Code:"
                } else if (stateCode) {
                    apiUrl = `http://localhost:3001/states?state_code=${stateCode}`;
                    console.log("State Code:", stateCode); // Add label "State Code:"
                } else {
                    apiUrl = "http://10.25.53.135:3001";
                }            

                const response = await fetch(apiUrl);
                const data = await response.json();
                const formattedData = data.map((item) => ({
                    ...item,
                    date_from: formatDate(item.date_from),
                    date_to: formatDate(item.date_to),
                    granularity: formatGranularity(item.granularity),
                    data_freq: formatFrequency(item.data_freq),
                    unit_indicator_1_national_level: formatUnit(item.unit_indicator_1_national_level),
                    unit_indicator_2_national_level: formatUnit(item.unit_indicator_2_national_level),
                    no_indicator_1_national_level: formatValue(item.no_indicator_1_national_level),
                }));
                setData(formattedData);
                setLoading(false);
                for (const item of formattedData) {
                    const projectCode = item.project_code;
                    try {
                        const secondApiUrl = `http://10.23.124.59:2222/getSchemeLogo?schemeCode=${projectCode}`;
                        const secondApiResponse = await fetch(secondApiUrl);
                        const secondApiBlob = await secondApiResponse.blob();
                        const imageUrl = URL.createObjectURL(secondApiBlob);
                        setLogoMapping((prevMapping) => ({
                            ...prevMapping,
                            [projectCode]: imageUrl,
                        }));
                    } catch (error) {
                        console.error(`Error in second API call for project code ${projectCode}:`, error);
                    }
                }
            } catch (error) {
                console.error("Error in API call:", error);
            }
        };

        fetchData();
    }, [sectorCode, ministryCode, stateCode ]);

    return (
        <>
        <Header />
            <section className="BI__product__container">
                {/* <img src={bg_img} alt="" className="bg_img p_db" /> */}
                <Filters></Filters>                                  
                <div className="dept_color1 dept_container">
                    <div className="container-fluid"> 
                        <div className="row CKR_pad">

                            {data.map((item) => {
                                return (
                                    <div key={item.project_code}
                                        className="col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-4">
                                        <div className="tiles_container">
                                            <div className="scheme__name">
                                                <a className="scheme_logo" alt="" title="View Native Dashboard">
                                                    <img src={logoMapping[item.project_code]}
                                                        alt={`Logo for Project Code ${item.project_code}`}/>
                                                </a>
                                                <h6 className="mb-0 mx-2">{item.project_full_name}</h6>
                                            </div>
                                            <div className="kpi_box py-2">
                                                <table className="kpi_table mb-2">
                                                    <tbody>
                                                        <tr>
                                                            <td className="">{item.kpi_name_1}</td>
                                                            <td>
                                                                <p className="scheme__value mb-0">
                                                                    {item.no_indicator_1_national_level}{" "}
                                                                    {item.unit_indicator_1_national_level}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>{item.kpi_name_2}</td>
                                                            <td>
                                                                <p className="scheme__value mb-0">
                                                                    {item.no_indicator_2_national_level}{" "}
                                                                    {item.unit_indicator_2_national_level}
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="date_footer">
                                                <p className="mb-0 frequency_box"><span>{item.data_freq}</span>  <span>{item.granularity}</span>  <span>{item.ministry_dgqi}</span></p>
                                                <p className="mb-0 as_ondate">
                                                    {item.date_from} - {item.date_to}
                                                </p>
                                            </div>
                                            <div className="on_hover">
                                                <div className="h_box">
                                                <a><button onClick={() => handleViewClick()} ><img className="view_btn" src={View_icon} alt="view" /> View </button></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            <Footer className="overview_pad prayas__ml_250" />
        </>
    );
};

export default Dashboard;
