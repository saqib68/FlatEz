import React, { useState } from "react";
import styles from './Home.module.css'; // Import the CSS module

import Create from "./create";
import Join from "./Join"; 

const Home = () => {
  const [createContent, setCreateContent] = useState("");
  const [joinContent, setJoinContent] = useState("");

  const openCreate = (content) => {
    setCreateContent(content);
  };

  const closeCreate = () => {
    setCreateContent("");
  };

  const openJoin = (content) => {
    setJoinContent(content);
  };

  const closeJoin = () => {
    setJoinContent("");
  };

  let componentToRender = null;

  if (createContent === "Create Flat") {
    componentToRender = <Create closeCreate={closeCreate} />;
  } else if (joinContent === "Enter Existing Flat") {
    componentToRender = <Join closeJoin={closeJoin} />;
  }

  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.mainContainer}`}>
        <h1 className="mb-4">Flat Management</h1>
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.btn} btn-lg`}
            onClick={() => openCreate("Create Flat")}
          >
            Create Flat
          </button>
          <button
            className={`${styles.btn} btn-lg`}
            onClick={() => openJoin("Enter Existing Flat")}
          >
            Enter Existing Flat
          </button>
        </div>
      </div>
      {componentToRender}
    </div>
  );
};

export default Home;
