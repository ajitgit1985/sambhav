import React, { useState, useEffect, useRef, useMemo } from "react";
import { GetAllProjects, GetAllState, GetAllYears } from "../api/pragyanAPI";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import axios from "axios";
import { useParams } from "react-router-dom";
import Select from "react-select";
import Back from "../assets/images/back.svg";
import { saveAs } from "file-saver";
import Reset from "../assets/images/reset_icon.svg";
import { useNavigate } from "react-router-dom";
import { useTable, usePagination } from "react-table";

function DataTable({ columns, filteredData }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex },
    gotoPage, // Add gotoPage
  } = useTable(
    {
      columns,
      data: filteredData, // Use filteredData for pagination
      initialState: { pageIndex: 0, pageSize: 10 }, // Set initial page size here
    },
    usePagination
  );

  const handlePageChange = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pageOptions.length) {
      gotoPage(pageIndex);
    }
  };

  const pageRange = (pageIndex, pageCount) => {
    const start = Math.max(0, pageIndex - 4); // Adjust as needed
    const end = Math.min(start + 9, pageCount - 1); // Display 10 pages
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      <div className="table-responsive">
        <table
          {...getTableProps()}
          className="NETable project_data_table table table-bordered table-hover"
        >
          <thead className="table-light">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="table-group-divider">
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          Previous
        </button>{" "}
        {pageRange(pageIndex, pageOptions.length).map((index) => (
          <button
            className="innerPgItem"
            key={index}
            onClick={() => handlePageChange(index)}
            style={{
              fontWeight: pageIndex === index ? "bold" : "normal",
              backgroundColor: pageIndex === index ? "#085dad" : "#fff",
              color: pageIndex === index ? "#fff" : "#000",
            }}
          >
            {index + 1}
          </button>
        ))}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          Next
        </button>{" "}
      </div>
    </>
  );
}

const ProjectDataLog = () => {
  const [data, setData] = useState([]);
  const { projectCode } = useParams();
  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const selectInputRef = useRef();
  const navigate = useNavigate();
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  // const [projectStateFilter, setProjectStateFilter] = useState({ show: false });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const columns = useMemo(
    () => [
      { Header: "Sr. No.", accessor: "sn" },
      { Header: "State Code", accessor: "stateCode" },
      { Header: "State Name", accessor: "stateName" },
      { Header: "Dist Code", accessor: "distCode" },
      { Header: "District Name", accessor: "districtName" },
      { Header: "City Code", accessor: "cityCode" },
      { Header: "City Name", accessor: "cityName" },
      { Header: "village Code", accessor: "villageCode" },
      { Header: "village Name", accessor: "villageName" },
      { Header: "kpi Id", accessor: "kpiId" },
      { Header: "Indicator", accessor: "indicator" },
      { Header: "Value", accessor: "value" },
      { Header: "Unit", accessor: "unit" },
      { Header: "Year", accessor: "year" },
    ],
    []
  );

  useEffect(() => {
    fetchProjects();
    fetchStates();
    fetchYears();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [data]);

  const fetchProjects = async () => {
    try {
      const data = await GetAllProjects();
      const options = data.map((project) => ({
        value: String(project.projectCode), // Ensure projectCode is treated as a string
        label: project.projectName,
      }));
      setProjectOptions(options);

      // Set selectedProject to '0' by default
      const defaultOption = options.find((option) => option.value === "0");
      setSelectedProject(defaultOption);

      // Fetch data for projectCode=0 initially
      fetchData("0");
    } catch (error) {
      console.error("Error fetching sector data:", error);
    }
  };

  const handleProjects = (selectedOption) => {
    if (selectedOption) {
      setSelectedProject(selectedOption);
      // Fetch data for the selected project
      fetchData(selectedOption.value);
      setSelectedState(null);
      setSelectedYear(null);
    }
  };

  const fetchStates = async () => {
    try {
      const data = await GetAllState();
      const options = data.map((state) => ({
        value: state.stateCode,
        label: state.stateName,
      }));
      setStateOptions(options);
    } catch (error) {
      console.error("Error fetching state data:", error);
    }
  };

  const handleStates = (selectedOption) => {
    setSelectedState(selectedOption);

    let a;
    if (filteredData.length !== 0) {
      a = filteredData;
    } else {
      a = data;
    }

    const filteredData1 = a.filter(
      (item) => item.stateName === selectedOption.label
    );

    setFilteredData(filteredData1);
  };

  const fetchYears = async () => {
    try {
      const data = await GetAllYears();
      const options = data.map((year) => ({
        value: year.yearCode,
        label: year.yearName,
      }));
      setYearOptions(options);
    } catch (error) {
      console.error("Error fetching state data:", error);
    }
  };

  const handleYears = (selectedOption) => {
    setSelectedYear(selectedOption);

    let a;
    if (filteredData.length !== 0) {
      a = filteredData;
    } else {
      a = data;
    }
    const filteredData1 = a.filter(
      (item) => item.year === selectedOption.label
    );
    setFilteredData(filteredData1);
  };

  const fetchData = async (projectCode) => {
    try {
      const response = await axios.get(
        `http://10.23.124.59:2222/getAllRawDataFromReplica?projectCode=${projectCode}`
      );
      console.log("projectCode", projectCode);
      setData(response.data);
      // setProjectStateFilter({ show: true });
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    if (projectCode) {
      fetchData(projectCode);
    }
  }, [projectCode]);

  const exportToCSV = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "project_data.csv");
  };

  const convertToCSV = (dataArray) => {
    const header = Object.keys(dataArray[0]).join(",");
    const rows = dataArray.map((obj) => Object.values(obj).join(","));
    return `${header}\n${rows.join("\n")}`;
  };

  const handleClear = () => {
    if (selectInputRef.current && selectInputRef.current.select) {
      selectInputRef.current.select.clearValue();
    }
    setSelectedState(null);
    setSelectedYear(null);
    fetchProjects();
    navigate(`/projectdataLog`);
  };

  return (
    <div>
      <Header />
      <section className="BI__product__container">
        <div className="dropdown__header CKR_pad">
          <div className="container-fluid mb-2">
            <div className="flex row py-2">
              <div className="d-flex align-items-center justify-start col-md-5 px-1">
                <div className="row w-100">
                  <div className="btnbox px-1">
                    <a href="/dashboard" className="NEbtn back_btn">
                      <img src={Back} alt="reset icon" /> Back
                    </a>
                  </div>
                  <div className="col-7 px-1 select-container">
                    <Select
                      value={selectedProject}
                      placeholder="Select Project"
                      options={projectOptions}
                      onChange={handleProjects}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex col-md-7 justify-content-end">
                {/* {projectStateFilter.show && ( */}
                <div className="col-3 px-1 select-container project_year_filter">
                  <Select
                    value={selectedYear}
                    placeholder="Select Year"
                    options={yearOptions}
                    onChange={handleYears}
                  />
                </div>
                <div className="col-3 px-1 select-container project_state_filter">
                  <Select
                    value={selectedState}
                    placeholder="Select State"
                    options={stateOptions}
                    onChange={handleStates}
                  />
                </div>
                {/* )} */}
                <div className="box_reset px-1">
                  <button
                    className="NEbtn reset_btn px-2"
                    onClick={() => handleClear("")}
                    title="Reset Filter"
                  >
                    <img src={Reset} alt="reset icon" />
                  </button>
                </div>
                <div className="col-5">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="form-control "
                    value=""
                  />
                </div>
                <div className="d-flex px-3">
                  <button
                    className="NEbtn export_btn"
                    onClick={exportToCSV}
                    disabled={buttonDisabled}
                  >
                    Export to CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dept_color1 dept_container">
          <div className="container-fluid">
            <div className="row">
              <div className="tb">
                <DataTable
                  columns={columns}
                  // data={data}
                  filteredData={filteredData}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer className="overview_pad prayas__ml_250" />
    </div>
  );
};

export default ProjectDataLog;
