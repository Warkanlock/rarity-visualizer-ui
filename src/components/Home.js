import React, { useContext, useState } from "react";
import SummonNewWarriorModal from "./SummonNewWarriorModal";
import { toast } from "react-toastify";
import { RarityContext } from "../context/RarityProvider";
import { Route, Switch } from "react-router";
import WarriorPage from "./WarriorPage";
import YourWarriorsPage from "./YourWarriosPage";
import { NavLink } from "react-router-dom";

const Home = () => {
  const [context] = useContext(RarityContext);
  const [showSummonNewWarriorModal, setShowSummonNewWarriorModal] =
    useState(false);
  const [summoners, setSummoners] = useState([]);
  const [summonId, setSummonId] = useState(null);
  const [loading, setLoading] = useState(false);

  const summonPlayer = async (classId) => {
    if (classId != null) {
      const id = toast.loading("Summoning warrior...");
      try {
        const promise = context.contract_base.methods
          .summon(classId)
          .send({ from: context.accounts[0] });
        const response = await promise;
        setSummoners((prevState) => [
          ...prevState,
          { id: response.events.summoned.returnValues[2] },
        ]);
        setSummonId(response.events.summoned.returnValues[2]);
        setShowSummonNewWarriorModal(false);
        toast.update(id, {
          render: `You just summon your player! ${response.events.summoned.returnValues[2]}`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (ex) {
        toast.update(id, {
          render: `Something went wrong! Try Again!.`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <React.Fragment>
      {showSummonNewWarriorModal && (
        <SummonNewWarriorModal
          summonId={summonId}
          setShowSummonNewWarriorModal={setShowSummonNewWarriorModal}
          summonPlayer={summonPlayer}
        />
      )}
      <div className="container-box">
        <nav className="navigation-bar">
          <NavLink exact className="nav-link" activeClassName="selected" to="/">
            Home
          </NavLink>
          <NavLink
            exact
            className="nav-link"
            activeClassName="selected"
            to="/Warriors"
          >
            Warriors
          </NavLink>
          <button
            className="summon-new"
            disabled={summonId === null}
            onClick={() => setShowSummonNewWarriorModal(true)}
            style={{ float: "right" }}
          >
            Summon new warrior
          </button>
        </nav>
      </div>
      <Switch>
        <Route exact path="/Warriors">
          <YourWarriorsPage />
        </Route>
        <Route path="/*">
          <WarriorPage
            summonId={summonId}
            setSummonId={setSummonId}
            summoners={summoners}
            setSummoners={setSummoners}
            loading={loading}
            setLoading={setLoading}
          />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export { Home };
