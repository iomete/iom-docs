---
slug: /data-governance-for-modern-data-stack
title: Data Governance for modern data stack
authors: aytan
hide_table_of_contents: true
tags: [Educational, Company]
image: /img/blog/2022-10-04-data-governace/data-governance-for-modern-data-stack.png
description: Data Governance is a concept that entered our lives with Big Data and has been implemented in many institutions and organizations.
---

<head>
  <title>Data Governance for modern data stack | iomete blog</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="googlebot" content="noindex"/>
</head>

![Data Governance for modern data stack](/img/blog/2022-10-04-data-governace/data-governance-for-modern-data-stack.png)

<!-- truncate -->

Data Governance is a concept that entered our lives with Big Data and has been implemented in many institutions and organizations. Let's assume that we have high-quality data and provide positive value to our company. No matter how high quality our data is, if we cannot provide this data to our business units, there is an inconsistency between the reports we use or each business unit's sales data is interpreted differently.


## What is Data Governance?
A simple definition of data governance is the central processes and policies governing enterprise data assets' management.

To give a simple definition, we can say: that these are the central processes and policies that govern the management of corporate data assets. Its main purpose is to identify which data and information are important, the processes to manage chosen data, and measure the success of the effort to achieve business goals. Data Governance deals with the origin of the data by addressing its questions clearly and directly and answers the questions of

- Who can access the data?
- What can be done with this accessed data?
- How is data classified and cataloged?
- What is the quality and integrity of the data?


## Purpose of Data Governance
Data Governance has three purposes:

- Ensuring data quality;
- Build data literacy;
- Maximizing data used for the benefit of the organization

![Data Quality](/img/blog/2022-10-04-data-governace/data-quality.jpeg "Data Quality")

Ensuring data quality is the first step in the data governance mission. In this context, data quality is defined by multiple data validity (Data Quality = Completeness x Validity). That is, collecting all the necessary data for an analytics use case and ensuring that the data is valid. The data governance committee should have strategies to support and improve data quality, ensuring completeness and validity of data to support analytics.

The second goal is to build data literacy across the enterprise, and the data governance committee should support this initiative. Just as it makes no sense to establish a library in an illiterate community, it also makes no sense to invest in a data warehouse's technology and data contained in an organization that lacks data literacy. The data governance committee should sponsor the education, training, and recruiting practices that build the organization's data literacy.

The third purpose is to use data for its benefit. Creating a data-driven culture maximizes the organization's data value, reduces costs, improves quality, and reduces risk. Supporting data quality and data literacy is not enough. Who should use these data and skills to create a culture that seeks continuous self-improvement through the spotlight of data?

## What Are the Steps of a Data Governance Plan?
The first step in developing a data governance plan is understanding the need for a plan. Organizations committed to prioritizing governance are more likely to succeed in this process. An organization's data management activities include established policies.

It also serves to coordinate the definition of policies and standards and also to ensure compliance. The data governance program; includes the organizational structure, an operating model in which these parties work together, and defined procedures that guide their activities.

In general, the purposes of establishing a data governance program are divided into three:

- Define and adopt policies, standards, and rules that govern all aspects of the data lifecycle;
- Operationalize compliance with policies and standards and put these procedures into production
- Continuously monitor compliance and take action when policies are not followed.

## Approaches to the Implementation of the Data Governance Program
Implementing a data governance program in the correct detail in an organized and disciplined way is a difficult task. The amount and size of data increase complexity for organizations that process and protect data. Organizations that want to oversee data management and resolve data issues choose to take one of two possible approaches to implementing a data governance program:

**Top-Down:** An approach adopted by businesses that recognize the need for enterprise-wide change. Change starts with hiring a CDO (Chief Data Officer), establishing a data governance council, and scheduling meetings with the data team to implement agreed data policies.

**Bottom-Up:** Some businesses start by collecting structured metadata that forms the basis for standards and rules using automated data generation tools.


## How is Data Governance structured?
An effective data governance program; Maximizes the value of data for operational effectiveness, decision making, and regulatory compliance while minimizing the risks associated with poor data management. Includes basic tasks. A proper Data Governance organization, workflow, tools and creating an effective data stack, etc. Enterprise stakeholders prioritize data management by hiring chief data officers (CDOs). Policies that control corporate data must be determined: processes and procedures that ensure compliance with data policies, standards, and business rules.

![prioritize data management](/img/blog/2022-10-04-data-governace/prioritize-data-management.jpeg)


As the diagram shows, there are multiple layers in the data governance process established under executive and board leadership. The data governance committee, data administrators, data architects and programmers, database and system administrators, and the access control system surround the technical data warehouse and analysis platform. At first glance, these layers may seem hierarchical, but if applied properly, the layers complement each other efficiently. When put together effectively, these data management layers provide data analysts with efficient and robust results.

From the high-level guidance and aspirations of the executive and board layers to the low-level, embedded technology of the information system that supports EDW (enterprise data warehouse), each layer plays an important role in data management.


**Executive and Board Leadership** — Executive and board leadership set strategic goals for analytical solutions, which are translated into an implementation strategy by the data management committee.

**Data Governance Committee** — The task of the data governance committee is to address this demonstrated goal and translate it into analytical skills and toolkits. The Committee evaluates options to achieve this goal. Works as a sponsor for the development of necessary skills within the organization. These skills include the data analytics team and IT skills to manage the data warehouse. Data managers are critical in reviewing and approving data warehouse access to data content. At this point, the Committee will also begin to define general principles and processes for approving and auditing that access to determine who has access to what data at EDWH.

**Data Stewards** — The data controller plays a crucial role. Data representative candidates are employees at the forefront of data collection in the organization and understand how data is collected in their areas of responsibility, how the information systems that support their areas collect this data and any deficiencies or quality issues in it. Data managers include business units. All data managers contribute to developing an analytics use case to ensure that the data targeted to support analytics is suitable for the analytics use case. Data managers serve as data content specialists and consultants as data architects and analysts.

**Data Architects and Programmers** — In consultation with data managers, they translate the requests of the executive team and data governance Committee into the analytics use case in the data warehouse. They link and organize this data for use in specific analytical scenarios. They must ensure that the data is properly modeled and stored in EDWH.

**Database and System Administrators** — Database and system administrators, EDWH audit and access control systems; implements and structures to reflect high-level data access and security principles as specified by the executive team and data governance committee. Database and system administrators work closely with data architects and programmers to ensure that data content and visualization applications integrate with operating systems and database management systems that support the data warehouse. Once data managers approve, data architects and programmers will provide systems and database administrators with the names and roles of people in the organization that is approved for access to the contents of the data warehouse.

**Data Access Control System** — The data access and control system is embedded in the operating system and database management system that supports EDWH. The system provides tools to associate the usernames of people logged into EDWH with their level of authorized access to data content and visualization applications. The access control system also provides an audit trail to monitor who accessed what data and when.

**Data Analyst** — All six layers in the data governance system work together in a complementary way to provide a supportive environment for data analysts. In a fully mature, data-literate culture, everyone is a data analyst within their role in the organization. In this context, a data analyst can be anyone from a technical data engineer working in a business unit to a board member.

Speaking of roles, it is worth mentioning that. The number of roles in EDWH needs to be severely restricted. EDWH's administrator must be the data controller for EDWH roles; role management should not fall to systems or database administrators. Experience shows that if roles are not carefully managed and constrained, the number of roles grows exponentially, making their management difficult. It may create security risks. Analysts may access data they are not authorized to view, or viewers may not be able to access the data they want to see.

## Why do companies choose iomete?
iomete platform also covered security of data inside data policies module. In this module admin of console can create different policies for company.

![iomete data governance](/img/blog/2022-10-04-data-governace/iomete-data-governance.png)

iomete platform also covered the security of data inside the data policies module. In this module admin of the console can create different policies for the company. For example, the admin can create a policy for the finance team that hides(masking) some tables inside the database. Also, the admin can choose some access policies for the finance team to keep confidentiality inside the different teams of the company.

## Conclusion
To sum up, different teams of the companies need to understand that:

It is important to consider that Data Governance is Not Data Management. Data management refers to the management of all data lifecycle needs of an organization. Data governance is the core component of data management that connects nine disciplines: data quality, reference and master data management, data security, database operations, metadata management, and data storage.

Data Governance is Not Master Data Management. Master data management (MDM) focuses on identifying an organization's key assets and improving the quality of that data. For example, a data governance program will define master data models, detail retention policies for data, and define roles and responsibilities for data authoring, remediation, and access. Customers, suppliers, medical providers, etc. It ensures you have the most complete and accurate information available about key assets such as However; there is no successful MDM (master data management) without proper governance.

Data Governance is Not Data Stewardship. Data management ensures that the right people are given the right data responsibilities. Data management refers to the activities necessary to ensure that data is under control and easy for discovery and processing by appropriate parties. Data governance is mostly about strategy, roles, organization, and policies, while data management is all about execution and operationalization. Data managers take care of data assets, ensuring that actual data is consistent with the data governance plan, linked to other data assets, and controlled for data quality, compliance or security.