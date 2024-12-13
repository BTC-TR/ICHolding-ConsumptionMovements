sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/btc/zwmtuketimhareketleri/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    function (Controller,
        BaseController,
        MessageBox,
        MessageToast) {
        "use strict";

        return BaseController.extend("com.btc.zwmtuketimhareketleri.controller.Main", {
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
                this._focusInput("idBarkodInput", 300);
            },

            onKaynakDepoAdresiInputLiveChange: function (oEvent) {

            },

            onBarkodInputSubmit: function (oEvent) {
                this._checkBrcode(oEvent.getParameter("value"));
                this._focusInput("idMiktarInput", 300);
            },

            onBarkodInputLiveChange: function (oEvent) {

            },

            onMengeInputSubmit: function (oEvent) {
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
