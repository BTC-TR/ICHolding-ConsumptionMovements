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
                this._getMasrafYeri();
                this._getSiparisNo();
                this._getPyp();

                this._focusInput("idHareketTuruInput", 300);
            },

            onHareketTuruInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value").toUpperCase(),
                    aHareketTurleri = this._jsonModel.getData().HareketTuruSH,
                    oHareketTuru = aHareketTurleri.find((item) => {
                        return item.Bwart === sValue
                    });

                if (oHareketTuru) {
                    oEvent.oSource.setValue(oHareketTuru.Bwart);
                    oEvent.oSource.setDescription(oHareketTuru.Btext);
                    this._focusInput("idKaynakDepoAdresiInput", 200)

                    if (oHareketTuru.Bwart === "A09" || oHareketTuru.Bwart === "A30" || oHareketTuru.Bwart === "221" || oHareketTuru.Bwart === "221Q") {
                        if (oHareketTuru.Bwart === "A09" || oHareketTuru.Bwart === "A30") {
                            this._jsonModel.setProperty("/SiparisNoVisibility", true)
                        } else {
                            this._jsonModel.setProperty("/SiparisNoVisibility", false)
                        }
                    } else {
                        if (oHareketTuru.Bwart !== "A09" || oHareketTuru.Bwart !== "A30") {
                            this._jsonModel.setProperty("/SiparisNoVisibility", false)
                        }
                        this._jsonModel.setProperty("/SiparisNoVisibility", false)
                    }

                    oHareketTuru.Bwart === "221" || oHareketTuru.Bwart === "A09" || oHareketTuru.Bwart === "A30" ? [this._jsonModel.setProperty("/PypEditable", true), this._jsonModel.setProperty("/PypVisibility", true)] : [this._jsonModel.setProperty("/PypEditable", false), this._jsonModel.setProperty("/PypVisibility", false)]

                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setDescription("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("HAREKET_TURU_BULUNAMADI"))
                }
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

            onBarkodInputSubmit: function (oEvent) {
                this._checkBrcode(oEvent.getParameter("value"), this._jsonModel.getData().Header.KaynakDepoAdresi, this._jsonModel.getData().Lgtyp);
                this._focusInput("idPypMasrafYeriInput", 300);
            },

            onBarkodInputLiveChange: function (oEvent) {
                this._checkBrcode(oEvent.getParameter("value"), this._jsonModel.getData().Header.KaynakDepoAdresi, this._jsonModel.getData().Lgtyp);
                this._focusInput("idPypMasrafYeriInput", 300);
            },

            onPypMasrafYeriInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value"),
                    aMasrafYeriSH = this._jsonModel.getData().MasrafYeriSH,
                    oMasrafYeri = aMasrafYeriSH.find((item) => {
                        return item.Kostl === sValue.toUpperCase()
                    });

                if (oMasrafYeri) {
                    oEvent.getSource().setValue(sValue.toUpperCase());
                    this._jsonModel.getData().SiparisNoVisibility ? this._focusInput("idSiparisNoInput", 300) : this._focusInput("idMiktarInput", 300);

                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("MASRAF_YERI_BULUNAMADI"))
                }
            },

            onSiparisNoInputSubmit: function (oEvent) {
                let that = this,
                    sValue = oEvent.getParameter("value"),
                    aSiparisNoSH = this._jsonModel.getData().SiparisNoSH,
                    oSiparisNo = aSiparisNoSH.find((item) => {
                        return item.Aufnr === sValue.toUpperCase()
                    });

                if (oSiparisNo) {
                    oEvent.getSource().setValue(sValue.toUpperCase());
                    this._focusInput("idMiktarInput", 300);
                } else {
                    oEvent.getSource().setValue("");
                    oEvent.getSource().focus();
                    return MessageToast.show(this.getResourceBundle().getText("SIPARIS_BULUNAMADI"))
                }
            },

            onMengeInputSubmit: function (oEvent) {
                let oHeaderData = this._jsonModel.getData().Header,
                    validate = true,
                    that = this;

                Object.entries(oHeaderData).forEach(([key, value]) => {
                    if (key === "Charg" || key === "StokBilgi" || key === "HareketTuruTanim" || key === "Pyp" || key === "MasrafYeriTanim") {
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

                if (this._jsonModel.getData().SiparisNoVisibility && this._jsonModel.getData().SiparisNo === "") {
                    return MessageBox.error(this.getResourceBundle().getText("ZORUNLU_ALANLARI_DOLDURUNUZ"))
                }

                if (parseInt(oHeaderData.Menge) > parseInt(oHeaderData.StokBilgi)) {
                    return MessageBox.error(this.getResourceBundle().getText("GIRILEN_MIKTAR_STOKTAN_BUYUK_OLAMAZ"))
                }

                this._addBarcode(this._jsonModel.getData().Header);
                this._focusInput("idBarkodInput", 300);
            },

            onTemizleButtonPress: function () {
                this._clearHeader();
                this._focusInput("idBarkodInput", 300);

                this._jsonModel.setProperty("/SiparisNoVisibility", false)
                this._jsonModel.setProperty("/SiparisNo", "")
                this._jsonModel.setProperty("/SiparisTanim", "")
                this._jsonModel.setProperty("/PypEditable", false)

                this._getItems()
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

                this._kaydetDialog = sap.ui.xmlfragment(this.getView().getId(), "com.btc.zwmtuketimhareketleri.view.Fragments.Dialog.BelgeKayit", this);
                this.getView().addDependent(this._kaydetDialog);

                this._kaydetDialog.open();

            },

            onIptalButtonPress: function (oEvent) {
                oEvent.oSource.getParent().close();
            },

            onKaydetBelgeButtonPress: function () {
                if (!this._jsonModel.getData().BelgeTarihi || !this._jsonModel.getData().BelgeMetni) {
                    return sap.m.MessageBox.error(this.getResourceBundle().getText("ZORUNLU_ALANLARI_DOLDURUN"))
                }
                this._saveTransfer(this._oTable.getItems());
            },
        });
    });
