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
            let that = this;
            this._readMultiData("/HareketTuruSHSet", [], this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/HareketTuruSH", oData.results);
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide();
            })
        },

        _getKaynakDepoAdresi: function () {
            let that = this;
            this._readMultiData("/KaynakDepoSHSet", [], this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/KaynakDepoAdresiSH", oData.results);
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide();
            })
        },

        _getMasrafYeri: function () {
            let that = this;
            this._readMultiData("/MasrafYeriSHSet", [
                new Filter("Bukrs", FilterOperator.EQ, "2401")
            ], this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/MasrafYeriSH", oData.results);
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide();
            })
        },

        _getSiparisNo: function () {
            let that = this;
            this._readMultiData("/SiparisNoSHSet", [], this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/SiparisNoSH", oData.results);
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide();
            })
        },

        _getPyp: function () {
            let that = this;
            this._readMultiData("/PypSHSet", [], this._oDataModel).then((oData) => {
                that._jsonModel.setProperty("/PypSH", oData.results);
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
                // MessageToast.show(JSON.parse(oError.responseText).error.message.value)
                that._jsonModel.setProperty("/TransferTablosu", [])
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
            })
        },

        _checkBrcode: function (sBarcode, oKaynakDepo, oLgtyp, sHareketTuru) {
            let that = this,
                sPath = this._oDataModel.createKey("/BarkodOkutSet", {
                    IvBarkod: sBarcode,
                    IvKlgpla: oKaynakDepo,
                    IvLgtyp: oLgtyp,
                    IvHareketTuru: sHareketTuru
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
                that._jsonModel.setProperty("/Lgort", oData.EvLgort)

                if (oData.EvPyp !== "") {
                    that._jsonModel.setProperty("/PypVisibility", true)
                }

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
                sSiparisTanim = this._jsonModel.getData().SiparisNoSH.find((item) => {
                    return item.Aufnr === that._jsonModel.getData().SiparisNo;
                }),
                sPath = this._oDataModel.createKey("/BarkodEkleSet", {
                    Werks: "2401",
                    Lgort: this._jsonModel.getData().Lgort,
                    Lgpla: oHeaderData.KaynakDepoAdresi,
                    Lgtyp: this._jsonModel.getData().Lgtyp,
                    Matnr: oHeaderData.Matnr,
                    Maktx: oHeaderData.Maktx,
                    Charg: oHeaderData.Charg,
                    PsPspnr: oHeaderData.Pyp,
                    Kostl: oHeaderData.Pyp_MasrafYeri,
                    Verme: oHeaderData.StokBilgi,
                    Menge: oHeaderData.Menge,
                    Meins: oHeaderData.Meins,
                    Bwart: oHeaderData.HareketTuru.slice(-1) === "Q" ? oHeaderData.HareketTuru.slice(0, -1) : oHeaderData.HareketTuru,
                    Aufnr: this._jsonModel.getData().SiparisNo,
                    Sobkz: oHeaderData.HareketTuru.slice(-1) === "Q" ? "Q" : "",
                    Ktext: sSiparisTanim ? sSiparisTanim.Ktext : ""
                }),
                sHareketTuru = oHeaderData.HareketTuru,
                sHareketTuruTanim = oHeaderData.HareketTuruTanim,
                oKaynakDepo = oHeaderData.KaynakDepoAdresi;

            this._readData(sPath, this._oDataModel).then((oData) => {
                that._clearHeader()
                that._jsonModel.setProperty("/Header/KaynakDepoAdresi", oKaynakDepo);
                that._jsonModel.setProperty("/Header/HareketTuru", sHareketTuru);
                that._jsonModel.setProperty("/Header/HareketTuruTanim", sHareketTuruTanim);

                that._jsonModel.setProperty("/SiparisNo", "")
                that._jsonModel.setProperty("/SiparisTanim", "")
                that._jsonModel.setProperty("/PypVisibility", false)
            }).catch((oError) => {
                MessageBox.error(JSON.parse(oError.responseText).error.message.value)
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
                this._getItems()
            })
        },

        _deleteRowTable: function (aSelectedRows) {
            let that = this,
                oEntry = {
                    Type: "",
                    NavToKalemSilMessage: []
                },
                aGuids = [];

            aSelectedRows.forEach((item) => {
                let oGuid = {
                    Guid: item.getObject().Guid
                };
                aGuids.push(oGuid);
            })

            oEntry.NavToKalemSilItem = aGuids;

            this._createData("/KalemSilHeaderSet", oEntry, this._oDataModel).then((oData) => {
                MessageToast.show(oData.NavToKalemSilMessage.results[0].Message)
            }).catch((oError) => {
                MessageToast.show(JSON.parse(oError.responseText).error.message.value)
            }).finally(() => {
                sap.ui.core.BusyIndicator.hide()
                this._getItems()
                this._oTable.removeSelections()
            })
        },

        _saveTransfer: function (aRows) {
            let that = this,
                oEntry = {
                    Type: "",
                    IvBelgeTarihi: this._jsonModel.getData().BelgeTarihi,
                    IvBelgeMetni: this._jsonModel.getData().BelgeMetni,
                    IvFis: this._jsonModel.getData().MalzemeFisi,
                    NavToKaydetMessage: []
                },
                aGuids = [];

            oEntry.IvBelgeTarihi.setHours(12)
            aRows.forEach((item) => {
                let oGuid = {
                    Guid: item.getBindingContext("jsonModel").getObject().Guid
                };
                aGuids.push(oGuid);
            })

            oEntry.NavToKaydetItem = aGuids;

            this._createData("/KaydetHeaderSet", oEntry, this._oDataModel).then((oData) => {
                oData.NavToKaydetMessage.results[0].Type === "S" ? MessageBox.success(oData.NavToKaydetMessage.results[0].Message, {
                    actions: MessageBox.Action.CLOSE,
                    onClose: function () {
                        that._getItems();
                        that._clearHeader()
                        that._kaydetDialog.close()
                        that._jsonModel.setProperty("/BelgeTarihi", {})
                        that._jsonModel.setProperty("/MalzemeFisi", "")
                        that._jsonModel.setProperty("/BelgeMetni", "")
                    }
                }) : MessageBox.error(oData.NavToKaydetMessage.results[0].Message)
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
                new Filter("Lgpla", FilterOperator.Contains, sValue),
                new Filter("Kostl", FilterOperator.Contains, sValue),
                new Filter("Ktext", FilterOperator.Contains, sValue),
                new Filter("Bwart", FilterOperator.Contains, sValue),
                new Filter("Btext", FilterOperator.Contains, sValue),
                new Filter("Aufnr", FilterOperator.Contains, sValue),
                new Filter("Posid", FilterOperator.Contains, sValue),
                new Filter("Post1", FilterOperator.Contains, sValue),
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

                setTimeout(() => {
                    this._getItems();
                }, 300);
            }

            if (sInputId.includes("idHareketTuruInput")) {

                if (sTitle === "A09" || sTitle === "A30" || sTitle === "221" || sTitle === "221Q" || sTitle === "A09Q" || sTitle === "A30Q") {
                    if (sTitle === "A09" || sTitle === "A30" || sTitle === "A09Q" || sTitle === "A30Q") {
                        this._jsonModel.setProperty("/SiparisNoVisibility", true)
                    } else {
                        this._jsonModel.setProperty("/SiparisNoVisibility", false)
                    }
                } else {
                    if (sTitle !== "A09" || sTitle !== "A30") {
                        this._jsonModel.setProperty("/SiparisNoVisibility", false)
                    }
                }

                sTitle === "221" || sTitle === "A09" || sTitle === "A30" ? [this._jsonModel.setProperty("/PypEditable", true), this._jsonModel.setProperty("/PypVisibility", true)] : [this._jsonModel.setProperty("/PypEditable", false), this._jsonModel.setProperty("/PypVisibility", false)]

                this._focusInput("idKaynakDepoAdresiInput", 200)
            }

            sInputId.includes("idPypMasrafYeriInput") && this._jsonModel.getData().SiparisNoVisibility ? this._focusInput("idSiparisNoInput", 200) : sInputId.includes("idPypMasrafYeriInput") && !this._jsonModel.getData().SiparisNoVisibility ? this._focusInput("idMiktarInput", 200) : ""
            sInputId.includes("idSiparisNoInput") ? this._focusInput("idMiktarInput", 200) : ""
            this._valueHelpInput.setValue(sTitle);
            this._valueHelpInput.setDescription(sDescription);
        },

        onSelectDialogCancel: function (oEvent) {
            oEvent.getSource()._dialog.close();
        }
    });
});