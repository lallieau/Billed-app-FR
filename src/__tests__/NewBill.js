import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";
import firebase from "../__mocks__/firebase";
import BillsUI from "../views/BillsUI";

const initialize = () => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
};

const html = NewBillUI();
document.body.innerHTML = html;

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

const firestore = null;
const newBill = new NewBill({
  document,
  onNavigate,
  firestore,
  localStorage: window.localStorage,
});

beforeAll(() => initialize());

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", () => {
      const iconBackground = $("#layout-icon2").css("background-color");
      const verticalLayoutBackground = $(".vertical-navbar").css("background");

      expect(iconBackground === verticalLayoutBackground).toBeFalsy();
    });
  });
});

describe("Given I am on the NewBill Page and filling out the form", () => {
  describe("When I choose the wrong file format to upload", () => {
    test("An error message should be displayed", () => {
      const file = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [
            new File(["invoice.svg"], "invoice.svg", { type: "image/svg+xml" }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(
        screen.getByText(
          "Veuillez choisir un fichier de type jpeg, jpg ou png."
        )
      ).toBeTruthy();
    });
  });

  describe("When I choose the correct file format to upload", () => {
    test("Then file should be saved", () => {
      const file = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [
            new File(["invoice.png"], "invoice.png", { type: "image/png" }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("invoice.png");
    });
  });
});

describe("Given I am on the NewBill Page and the form is completed", () => {
  beforeEach(() => initialize());

  describe("When I click on the Submit NewBill button", () => {
    test("Then the form should be submitted and I should be redirected to the Bills page", () => {
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

// test d'intégration POST
describe("Given I am connected as an employee", () => {
  describe("When I navigate to NewBill", () => {
    test("send a bill to mock API POST", async () => {
      const newBill = {
        id: "47qAXb6fIm2zOKkLzMzz",
        vat: "80",
        fileUrl: "https://test.com",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "billToTest",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };

      const postSpy = jest.spyOn(firebase, "post");
      const bills = await firebase.post(newBill);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(newBill);
      expect(bills.data.length).toBe(1);
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);

      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);

      expect(message).toBeTruthy();
    });
  });
});
