import { toast } from "react-toastify";
import { useState } from "react/cjs/react.development";

const TrasnferModal = ({
  setIsOpenTransferModal,
  summonerID,
  walletFrom,
  summonerName,
  context,
}) => {
  const [transferWallet, setTransferWallet] = useState("");

  const handleCloseTransferModal = (e) => {
    e.preventDefault();
    setIsOpenTransferModal(false);
  };

  const handleTrasnferButton = async (e) => {
    e.preventDefault();
    const id = toast.loading("Transfering summoner...");
    if (!transferWallet) {
      toast.update(id, {
        render: `Can't transfer to an empty name!`,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      setIsOpenTransferModal(false);
      return;
    }
    try {
      await context.contract_base.methods
        .safeTransferFrom(walletFrom, transferWallet, summonerID)
        .send({
          from: walletFrom,
          to: transferWallet,
        });
      setIsOpenTransferModal(false);
      toast.update(id, {
        render: `Transfer done to ${transferWallet}}`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (ex) {
      setIsOpenTransferModal(false);
      toast.update(id, {
        render: `Something went wrong! Try Again in a few seconds!`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <p>You are going to transfer: </p>
          <div className="modal-header-summoner">
            {"  " + summonerID} {" - " + summonerName}
          </div>
        </div>
        <div className="modal-body">
          <div className="content-trasnfer">
            <div className="content-trasnfer-info">
              <label htmlFor="from">From:</label>
              <input
                id="inputFrom"
                className="content-transfer-info-input"
                type="text"
                name="from"
                value={walletFrom}
                disabled
              />
            </div>

            <div className="content-trasnfer-info">
              <label htmlFor="to">To:</label>
              <input
                data-for="test"
                data-tip=""
                placeholder="Wallet adress"
                className="content-transfer-info-input"
                type="text"
                onChange={(e) => setTransferWallet(e.target.value)}
                name="to"
              />
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <button
            className="transfer-button"
            onClick={(e) => handleTrasnferButton(e)}
          >
            Transfer
          </button>
          <button
            className="close-button"
            onClick={(e) => handleCloseTransferModal(e)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrasnferModal;
