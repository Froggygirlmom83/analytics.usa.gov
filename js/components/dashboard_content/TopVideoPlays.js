import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import ChartBuilder from "../../lib/chart_helpers/chart_builder";
import DataLoader from "../../lib/data_loader";
import barChart from "../../lib/chart_helpers/barchart";
import { exceptions, titleExceptions } from "../../lib/exceptions";
import formatters from "../../lib/chart_helpers/formatters";

/**
 * Retrieves the top downloads report from the passed data URL and creates a
 * visualization for the count of users downloading files for the current
 * agency.
 *
 * @param {object} props the properties for the component
 * @param {string} props.dataHrefBase the URL of the base location of the data
 * to be downloaded including the agency path. In production this is proxied and
 * redirected to the S3 bucket URL.
 * @param {string} props.reportFileName the file name of the report to use as a
 * data source for the data visualization.
 * @param {number} props.numberOfListingsToDisplay the count of downloads
 * listings to display in the bar chart.
 * @returns {import('react').ReactElement} The rendered element
 */
function TopVideoPlays({
  dataHrefBase,
  reportFileName,
  numberOfListingsToDisplay,
}) {
  const dataURL = `${dataHrefBase}/${reportFileName}`;
  const ref = useRef(null);
  const [videoPlayData, setVideoPlayData] = useState(null);

  useEffect(() => {
    const initVideoPlaysChart = async () => {
      if (!videoPlayData) {
        const data = await DataLoader.loadJSON(dataURL);
        await setVideoPlayData(data);
      } else {
        if (__shouldDisplayVideoPlays()) {
          await __createVideoPlayChart();
        }
      }
    };
    initVideoPlaysChart().catch(console.error);
  }, [videoPlayData]);

  function __shouldDisplayVideoPlays() {
    return (
      videoPlayData &&
      videoPlayData.data &&
      Array.isArray(videoPlayData.data) &&
      videoPlayData.data.length > 2
    );
  }

  async function __createVideoPlayChart() {
    const chartBuilder = new ChartBuilder();
    await chartBuilder
      .setElement(ref.current)
      .setData(videoPlayData)
      .setTransformer((d) => d.data.slice(0, numberOfListingsToDisplay))
      .setRenderer((selection) => {
        const barchartRenderer = barChart()
          .label((d) => d.video_title)
          .value((d) => +d.total_events)
          .scale((values) =>
            d3.scale
              .linear()
              .domain([0, 1, d3.max(values)])
              .rangeRound([0, 1, 100]),
          )
          .format(formatters.addCommas);

        barchartRenderer(selection);

        // turn the labels into links
        selection
          .selectAll(".label")
          .each(function (d) {
            d.text = this.innerText;
          })
          .html("")
          .append("a")
          .attr("target", "_blank")
          .attr("rel", "noopener")
          .attr("href", (d) => exceptions[d.video_url] || d.video_url)
          .text((d) => titleExceptions[d.video_title] || d.video_title);
      })
      .build();
  }

  return (
    <>
      {__shouldDisplayVideoPlays() ? (
        <figure className="top-video-plays__bar-chart" ref={ref}>
          <div className="data bar-chart"></div>
        </figure>
      ) : (
        <div>
          <strong>
            <em>Video play data is unavailable</em>
          </strong>
        </div>
      )}
    </>
  );
}

TopVideoPlays.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  reportFileName: PropTypes.string.isRequired,
  numberOfListingsToDisplay: PropTypes.number.isRequired,
};

export default TopVideoPlays;
