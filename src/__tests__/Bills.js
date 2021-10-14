import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const iconBackground = $("#layout-icon1").css("background-color");
      const verticalLayoutBackground = $(".vertical-navbar").css("background");
      expect(iconBackground === verticalLayoutBackground).toBeFalsy();
    });

    // this test failed so it has been fixed (date sorting bug)
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(/(?<day>\d?\d)\s+(?<month>\w.+)[.]\s+(?<year>\d\d)/)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // the same tests as on the dashboard, replace DashboardUI with BillsUI

  describe("When I am on Bills Page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("When I am on Bills Page but it is loading", () => {
    test("Then, Error page should be rendered", () => {
      const html = BillsUI({ error: "some error message" });
      document.body.innerHTML = html;
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });

  // HandleClickIconEye method
  // the same test as on the dashboard but readjusted

  describe("When I am on Bills Page and I click on the icon eye", () => {
    test("Then a modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const bill = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();

      const handleClickIconEye = jest.fn(bill.handleClickIconEye);
      const iconEye = screen.getAllByTestId("icon-eye");
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon));
        userEvent.click(icon);
      });

      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy();
    });
  });

  // HandleClickNewBill method
  // the same test as for the HandleClickIconEye method but readjusted

  describe("When I am on Bills Page and I click on the New bill Button", () => {
    test("Then A new Bill Page is displayed", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const bill = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn(bill.handleClickNewBill);
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      buttonNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(buttonNewBill);

      expect(handleClickNewBill).toHaveBeenCalled();

      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
});
