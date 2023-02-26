---

title: Additional administrators
last_update:
  date: 10/04/2022 

---

export const Card = ({ title, children}) => (
  <a style={{ marginBottom: '10px', display: 'inline-block' }}>
    <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee3ea',
        borderRadius: '0.4rem',
        padding: '24px',
        margin: '10px 0px 10px 0px',
        display: 'inline-block' , 
        }}>
        <p style={{ color: '#777', marginBottom: '0px', display: 'flex'}}>{children}</p>
    </div>
  </a>
);

AWS Key Management Service (KMS) is an Amazon Web Services product that allows administrators to create, delete and control keys that encrypt data stored in AWS databases and products.
    
AWS KMS can be accessed within [AWS Identity and Access Management](https://www.techtarget.com/searchaws/definition/Amazon-Web-Services-AWS-Identity-and-Access-Management-IAM) by selecting the "Encryption Keys" section or by using the AWS KMS command-line interface or software development kit
    
IOMETE customer-stack Terraform module will use or create a KMS key only who run the Terraform code if additional administrator ARN`s not added. (AWS KMS see: [https://docs.aws.amazon.com/kms/latest/developerguide/overview.html](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html) )
    
Adding an additional administrator to the system will grant them access to manage Kubernetes resources in EKS. By default, only the creator of the resources has access to Kubernetes. To add additional administrators, include their user Amazon Resource Names (ARNs) when running the Terraform code. It is important to note that when adding additional ARNs, the creators must include their own ARNs in the list to ensure that they retain access to the resources.

<Card title=  "💡" >
<p  style={{
        margin: '0 10px',
        fontSize : '40px'
        }} >💡</p>
 Example: additional_administrators = ["arn:aws:iam::1234567890:user/your_arn",
 "arn:aws:iam::1234567890:user/user2", "arn:aws:iam::1234567890:user/user3"]                             
</Card>

