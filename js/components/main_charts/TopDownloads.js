import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import d3 from "d3";

import barChart from "../../lib/chart_helpers/barchart";
import formatters from "../../lib/chart_helpers/formatters";
import renderBlock from "../../lib/chart_helpers/renderblock";

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
function TopDownloads({
  dataHrefBase,
  reportFileName,
  numberOfListingsToDisplay,
}) {
  const reportURL = `${dataHrefBase}/${reportFileName}`;
  const ref = useRef(null);

  useEffect(() => {
    const initTopDownloads = async () => {
      const result = await d3
        .select(ref.current)
        .datum({
          source: reportURL,
          block: ref.current,
        })
        .call(
          renderBlock
            .loadAndRender()
            .transform((d) => d.data.slice(0, numberOfListingsToDisplay))
            .render(
              barChart()
                .value((d) => +d.total_events)
                .label((d) =>
                  [
                    '<span class="name"><a class="top-download-page" target="_blank" rel="noopener" href=http://',
                    d.page,
                    ">",
                    d.page_title,
                    "</a></span> ",
                    '<span class="domain" >',
                    formatters.formatURL(d.page),
                    "</span> ",
                    '<span class="divider">/</span> ',
                    '<span class="filename"><a class="top-download-file" target="_blank" aria-label="',
                    formatters.formatFile(d.file_name),
                    '" rel="noopener" href=',
                    formatters.formatProtocol(d.page),
                    formatters.formatFile(d.file_name),
                    ">",
                    "download file",
                    "</a></span>",
                  ].join(""),
                )
                .scale((values) =>
                  d3.scale
                    .linear()
                    .domain([0, 1, d3.max(values)])
                    .rangeRound([0, 1, 100]),
                )
                .format(formatters.addCommas),
            ),
        );
      return result;
    };
    initTopDownloads().catch(console.error);
  }, []);

  return (
    <figure className="top-downloads__bar-chart" ref={ref}>
      <div className="data bar-chart"></div>
    </figure>
  );
}

TopDownloads.propTypes = {
  dataHrefBase: PropTypes.string.isRequired,
  reportFileName: PropTypes.string.isRequired,
  numberOfListingsToDisplay: PropTypes.number.isRequired,
};

export default TopDownloads;
