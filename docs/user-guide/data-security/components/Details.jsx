import React from "react";

export default function Details() {
  return (
    <>
      <p>Policy details includes the following properties.</p>

      <table>
        <thead>
          <tr>
            <th style={{ whiteSpace: "nowrap" }}>Field</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ whiteSpace: "nowrap" }}>Policy name</td>
            <td>Enter an appropriate policy name. This name cannot be duplicated in another policy.</td>
          </tr>
          <tr>
            <td style={{ whiteSpace: "nowrap" }}>Enabled & Disabled</td>
            <td>The policy is enabled by default. If disabled, the policy will not affect user queries.</td>
          </tr>
          <tr>
            <td style={{ whiteSpace: "nowrap" }}>Normal & Override</td>
            <td>
              When switched to <b>Override</b>, the access permissions in the policy override the access permissions in
              existing policies.
            </td>
          </tr>
          <tr>
            <td style={{ whiteSpace: "nowrap" }}>Add Validity Period</td>
            <td>
              Specify a start and end time for the policy. <i>(Optional)</i>
            </td>
          </tr>
          <tr>
            <td style={{ whiteSpace: "nowrap" }}>Description</td>
            <td>
              Describe the purpose of the policy. <i>(Optional)</i>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
