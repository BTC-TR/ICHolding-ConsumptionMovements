sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/btc/zwmtuketimhareketleri/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/btc/zwmtuketimhareketleri/model/formatter"
],
    function (Controller,
	BaseController,
	MessageBox,
	MessageToast,
	formatter) {
        "use strict";

        return BaseController.extend("com.btc.zwmtuketimhareketleri.controller.Main", {
            formatter: formatter,
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function () {
                this._jsonModel = this.getModel("jsonModel");
                this._oDataModel = this.getModel();
                this._userId = sap.ushell.Container.getService("UserInfo").getId();
                this._oTable = this.getView().byId("idTransferTable");

                this._getHareketTuru();
                this._getKaynakDepoAdresi();

                this._focusInput("idHareketTuruInput", 300);
            },

            onHareketTuruInputSubmit: function (oEvent) {
                this._focusInput("idKaynakDepoAdresiInput", 300);

                //seçilen hareket turune göre pyp masraf yerini aç
            },

            onHareketTuruInputLiveChange: function (oEvent) {
            },

            onKaynakDepoAdresiInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value"),
                    aKayndakDepolar = this._jsonModel.getData().KaynakDepoAdresiSH,
                    oKAaynakDepo = aKayndakDepolar.find((item) => {
                        return item.Lgpla === sValue.toUpperCase()
                    });

                if (oKAaynakDepo) {
                    oEvent.getSource().setValue(sValue.toUpperCase());
                    this._jsonModel.setProperty("/Lgtyp", oKAaynakDepo.Lgtyp)
                    this._focusInput("idBarkodInput", 300);
                    this._getItems();
                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("DEPO_ADRESI_BULUNAMADI"))
                }
            },

            onKaynakDepoAdresiInputLiveChange: function (oEvent) {

            },

            onBarkodInputSubmit: function (oEvent) {
                this._checkBrcode(oEvent.getParameter("value"), this._jsonModel.getData().Header.KaynakDepoAdresi, this._jsonModel.getData().Lgtyp);
                this._focusInput("idMiktarInput", 300);
            },

            onBarkodInputLiveChange: function (oEvent) {
                this._checkBrcode(oEvent.getParameter("value"), this._jsonModel.getData().Header.KaynakDepoAdresi, this._jsonModel.getData().Lgtyp);
                this._focusInput("idMiktarInput", 300);
            },

            onMengeInputSubmit: function (oEvent) {
                let oHeaderData = this._jsonModel.getData().Header,
                    validate = true;

                Object.entries(oHeaderData).forEach(([key, value ]) => {
                    if (key === "Charg" || key === "Pyp_MasrafYeri" || key === "StokBilgi" || key === "HareketTuruTanim" || key === "Pyp") {
                        //
                    } else {
                        if (!value) {
                            return validate = false
                        }
                    }
                })

                if (!validate) {
                    return MessageBox.error(this.getResourceBundle().getText("ZORUNLU_ALANLARI_DOLDURUNUZ"))
                }

                // if (oHeaderData.Menge > oHeaderData.StokBilgi) {
                //     return MessageBox.error(this.getResourceBundle().getText("GIRILEN_MIKTAR_STOKTAN_BUYUK_OLAMAZ"))
                // }

                this._addBarcode(this._jsonModel.getData().Header);
                this._focusInput("idBarkodInput", 300);
            },

            onTemizleButtonPress: function () {
                this._clearHeader();
                this._focusInput("idBarkodInput", 300);
            },

            onSilButtonPress: function (oEvent) {
                if (oEvent.getSource().getParent().getParent().getSelectedContexts().length === 0) {
                    return MessageBox.error(this.getResourceBundle().getText("SATIR_SECINIZ"));
                }

                this._deleteRowTable(oEvent.getSource().getParent().getParent().getSelectedContexts());
            },

            onKaydetButtonPress: function () {
                if (this._oTable.getItems().length === 0) {
                    return MessageBox.error(this.getResourceBundle().getText("ISLENECEK_VERI_YOK"))
                }

                this._saveTransfer(this._oTable.getItems());
            }
        });
    });
