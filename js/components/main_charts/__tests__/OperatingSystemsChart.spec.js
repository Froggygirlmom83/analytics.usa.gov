import React from "react";
import { render } from "@testing-library/react";
import d3 from "d3";
import OperatingSystemsChart from "../OperatingSystemsChart";

jest.mock("d3", () => ({
  ...jest.requireActual("d3"),
  json: jest.fn(),
}));

describe("OperatingSystemsChart", () => {
  let component;
  let osData;
  let windowsData;

  describe("when data is not loaded", () => {
    beforeEach(() => {
      component = render(
        <OperatingSystemsChart dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in loading state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data is loaded", () => {
    beforeEach(async () => {
      osData = {
        name: "os",
        query: {},
        meta: {
          name: "Operating Systems",
          description:
            "30 days of visits, broken down by operating system and date, for all sites. (>100 sessions)",
        },
        totals: {
          visits: 1493441196,
          by_os: {
            iOS: 545836253,
            Windows: 446590663,
            Android: 288132572,
            Macintosh: 149049201,
            Linux: 33028818,
            "(other)": 542273,
            "Chrome OS": 28865009,
            "": 24490,
            Tizen: 27195,
            "(not set)": 1272412,
            Fuchsia: 20999,
            "OS/2": 19323,
            "Firefox OS": 15342,
            "Playstation 4": 10575,
            FreeBSD: 3893,
            UNIX: 781,
            BlackBerry: 1397,
          },
        },
        taken_at: "2024-03-11T13:59:13.780Z",
      };
      windowsData = {
        name: "windows",
        query: {},
        meta: {
          name: "Windows",
          description:
            "30 days of visits from Windows users, broken down by operating system version and date, for all sites. (>100 sessions)",
        },
        totals: {
          visits: 43324723,
          by_os_version: {
            7: 388717,
            8: 457270,
            10: 33015928,
            11: 8088274,
            2000: 1194830,
            8.1: 171876,
            XP: 7722,
            Vista: 106,
          },
        },
        taken_at: "2024-03-11T14:11:24.185Z",
      };

      d3.json.mockImplementation((url, callback) => {
        if (url.includes("os.json")) {
          callback(null, osData);
        } else if (url.includes("windows.json")) {
          callback(null, windowsData);
        }
      });
      component = render(
        <OperatingSystemsChart dataHrefBase="http://www.example.com/data/" />,
      );
      // Delay so that the nested charts have time to render.
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await delay(1000);
    });

    it("renders a component with data loaded", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("when data loading has an error", () => {
    beforeEach(async () => {
      d3.json.mockImplementation((url, callback) => {
        callback(new Error("you broke it"), null);
      });
      component = render(
        <OperatingSystemsChart dataHrefBase="http://www.example.com/data/" />,
      );
    });

    it("renders a component in error state", () => {
      expect(component.asFragment()).toMatchSnapshot();
    });
  });
});
