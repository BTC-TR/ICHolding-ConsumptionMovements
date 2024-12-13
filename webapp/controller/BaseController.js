sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/mvc/Controller",
    "com/btc/zwmtuketimhareketleri/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    ManagedObject,
    Controller,
    models,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast
) {
    "use strict";

    return Controller.extend("com.btc.zwmtuketimhareketleri.controller.BaseController", {
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        _callFunction: async function (
            sEntity,
            sMethod,
            oDataModel,
            oURLParameters
        ) {
            return new Promise((fnResolve, fnReject) => {
                sap.ui.core.BusyIndicator.show();
                const mParameters = {
                    method: sMethod,
                    urlParameters: oURLParameters,
                    success: fnResolve,
                    error: fnReject,
                };
                oDataModel.callFunction(sEntity, mParameters);
            });
        },

        _readMultiData: async function (entitySet, filters, oDataModel) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show();
                const options = {
                    filters: filters,
                    success: resolve,
                    error: reject,
                };
                oDataModel.read(entitySet, options);
            });
        },

        _readData: async function (sPath, oDataModel) {
            return new Promise(function (resolve, reject) {
                sap.ui.core.BusyIndicator.show();
                const options = {
                    success: resolve,
                    error: reject,
                };
                oDataModel.read(sPath, options);
            });
        },

        _createData: async function (sEntitySet, oEntry, oDataModel) {
            sap.ui.core.BusyIndicator.show(0);
            return new Promise(function (resolve, reject) {
                const options = {
                    success: resolve,
                    error: reject
                };
                oDataModel.create(sEntitySet, oEntry, options);
            });
        },

        _focusInput: function (inputId, timeout) {
            setTimeout(() => {
                this.getView().byId(inputId).focus();
            }, timeout);
        },
        _clearHeader: function () {
            this._jsonModel.setProperty("/Header", models.createJSONModel().getData().Header);
        },

        _getHareketTuru: function () {

        },

        _getKaynakDepoAdresi: function () {
            let that = this;
            this._readMultiData("/KaynakDepoSHSet", [], this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/KaynakDepoAdresiSH", oData.results);
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide();
            })
        },

        _getItems: function () {
            let that = this,
                aFilters = [
                    new Filter("IvKlgpla", FilterOperator.EQ, this._jsonModel.getData().Header.KaynakDepoAdresi)
                ];

            this._readMultiData("/KalemGetirSet", aFilters, this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/TransferTablosu", oData.results)
            }).catch((oError) => {
                MessageToast.show(JSON.parse(oError.responseText).error.message.value)
                that._jsonModel.setProperty("/TransferTablosu", [])
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
            })
        },

        _checkBrcode: function (sBarcode, oKaynakDepo, oLgtyp) {
            let that = this,
                sPath = this._oDataModel.createKey("/BarkodOkutSet", {
                    IvBarkod: sBarcode,
                    IvKlgpla: oKaynakDepo,
                    IvLgtyp: oLgtyp
                });

            this._readData(sPath, this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/Header/Barkod", oData.IvBarkod)
                that._jsonModel.setProperty("/Header/Matnr", oData.EvMatnr)
                that._jsonModel.setProperty("/Header/Maktx", oData.EvMaktx)
                that._jsonModel.setProperty("/Header/Charg", oData.EvCharg)
                that._jsonModel.setProperty("/Header/Pyp", oData.EvPyp)
                that._jsonModel.setProperty("/Xchpf", oData.EvXchpf)
                that._jsonModel.setProperty("/Header/StokBilgi", oData.EvVerme)
                that._jsonModel.setProperty("/Header/Meins", oData.EvMeins)

            }).catch((oError) => {
                this._jsonModel.setProperty("/Header/Barkod", "")
                this._focusInput("idBarkodInput", 200)
                MessageBox.error(JSON.parse(oError.responseText).error.message.value)
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
            })
        },

        _addBarcode: function (oHeaderData) {
            let that = this,
                sPath = this._oDataModel.createKey("/BarkodEkleSet", {
                    Werks: "",
                    Lgort: "",
                    Lgpla: oHeaderData.KaynakDepoAdresi,
                    Lgtyp: this._jsonModel.getData().Lgtyp,
                    Matnr: oHeaderData.Matnr,
                    Maktx: oHeaderData.Maktx,
                    Charg: oHeaderData.Charg,
                    PsPspnr: oHeaderData.Pyp_MasrafYeri,
                    Kostl: oHeaderData.Pyp_MasrafYeri,
                    Verme: oHeaderData.StokBilgi,
                    Menge: oHeaderData.Menge,
                    Meins: oHeaderData.Meins,
                    Bwart: "",
                }),
                sHareketTuru = this._jsonModel.getData().Header.HareketTuru,
                sHareketTuruTanim = this._jsonModel.getData().Header.HareketTuruTanim,
                oKaynakDepo = oHeaderData.KaynakDepoAdresi;

            this._readData(sPath, this._oDataModel).then((oData) => {
                that._clearHeader()
                that._jsonModel.setProperty("/Header/KaynakDepoAdresi", oKaynakDepo);
                that._jsonModel.setProperty("/Header/HareketTuru", sHareketTuru);
                that._jsonModel.setProperty("/Header/HareketTuruTanim", sHareketTuruTanim);
            }).catch((oError) => {
                MessageBox.error(JSON.parse(oError.responseText).error.message.value)
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
            })
        },

        _deleteRowTable: function (aSelectedRows) {
            let that = this,
                oEntry = {
                    Type: ""
                },
                aGuids = [];

            aSelectedRows.forEach((item) => {
                let oGuid = {
                    Guid: item.Guid
                };
                aGuids.push(oGuid);
            })

            oEntry.NavToKalemSilItem = aGuids;

            this._createData("/KalemSilHeaderSet", oEntry, this._oDataModel).then((oData) => {
                debugger;
            }).catch((oError) => {
                MessageBox.error(JSON.parse(oError.responseText).error.message.value)
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
            })
        },

        _saveTransfer: function (aRows) {
            let that = this,
                oEntry = {
                    Type: ""
                },
                aGuids = [];

            aRows.forEach((item) => {
                let oGuid = {
                    Guid: item.getBindingContext("jsonModel").getObject().Guid
                };
                aGuids.push(oGuid);
            })

            oEntry.NavToKaydetItem = aGuids;

            this._createData("/KaydetHeaderSet", oEntry, this._oDataModel).then((oData) => {
                debugger;
            }).catch((oError) => {
                MessageBox.error(JSON.parse(oError.responseText).error.message.value)
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
            })
        },

        _prepareValueHelpDialog: function (oEvent, fragmentName) {
            this._valueHelpInput = oEvent.getSource();
            this._valueHelpDialog = sap.ui.xmlfragment(this.getView().getId(), "com.btc.zwmtuketimhareketleri.view.Fragments.ValueHelp." + fragmentName, this);
            this.getView().addDependent(this._valueHelpDialog);
            this._valueHelpDialog.open();
            this._afterFocus(this._valueHelpDialog);
        },

        _afterFocus: function (valueHelp) {
            setTimeout(function () {
                var oSearchField = valueHelp._oSearchField;
                if (oSearchField) {
                    oSearchField.focus();
                }
            }, 500);
        },

        onSelectDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter([
                new Filter("Lgpla", FilterOperator.Contains, sValue)
            ], false);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },

        onSelectDialogConfirm: function (oEvent) {
            var sDescription,
                sTitle,
                sType,
                oSelectedItem = oEvent.getParameter("selectedItem"),
                sInputId = this._valueHelpInput.getId();
            oEvent.getSource().getBinding("items").filter([]);
            if (!oSelectedItem) {
                return;
            }
            sTitle = oSelectedItem.getTitle();
            sDescription = oSelectedItem.getDescription();
            sType = oSelectedItem.getInfo();

            if (sInputId.includes("idKaynakDepoAdresiInput")) {
                this._jsonModel.setProperty("/Lgtyp", sType);
                this._focusInput("idBarkodInput", 200)
                this._getItems();
            }
            this._valueHelpInput.setValue(sTitle);
            this._valueHelpInput.setDescription(sDescription);

        },

        onSelectDialogCancel: function (oEvent) {
            oEvent.getSource()._dialog.close();
        }
    });
});