# Public Access Restriction

import Card from "@site/src/components/Card";

## Using static IP for restricting access

IOMETE control plane uses EKS (AWS Kubernetes service) API address to connect and control data lakehouse and spark jobs. Downloading or copying code from IOMETE control-plane **kubernetes_public_access_cidrs** commented by default. 

If the customer has security compliance or any other concern to needs to restrict public access to EKS API must follow the next steps:



1. Uncomment  **kubernetes_public_access_cidrs** in Terraform script
2. Add static IP address (or address range for ex.: 5.194.94.20/30) to **“your_ip_range/mask”** section.

<Card title=  "" >
<p  style={{
        margin: '0 10px',
        fontSize : '40px'
        }} >💡</p> 
Please do not remove IOMETE's IP addresses (18.156.67.183/32”, “54.235.211.34”/32). Removing them will prevent the control plane from accessing the cluster, and the lakehouse will be inoperable.                                
</Card>

<Card title=  "" >
<p  style={{
        margin: '0 10px',
        fontSize : '40px',
        textAlign: 'center'
        
        }} >💡</p>
Need Static IP address or address range to restrict EKS public access                                 
</Card>

<Card title=  "💡" >
<p  style={{
        margin: '0 10px', 
        fontSize : '40px'
        }} >💡</p>
Please consider that only deployed IP addresses will access all resources and EKS created by Terraform
</Card>

