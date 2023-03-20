---
title: Run Your First Spark Job
description: Run Your First Spark Job. In this guide we explain how to run your first spark job on IOMETE
last_update:
  date: 10/04/2022
---

In this guide we explain how to run your first spark job on **IOMETE**.
___

At the console, navigate to **Job** menu and click to `Create New`

For the sake of simplicity let's use public IOMETE spark images. In this example, we are going to use `iomete/spark:3.2.1.0`

This docker image has pre-built `local:///opt/spark/examples/jars/spark-examples_2.12-3.2.1-iomete.jar` contains example spark applications

![Edit spark jobs](/img/guides/edit-spark-job.png)

In the following screenshot, you'll see how to configure main application file and main class. And you also specify how much compute unit you need form the job. **1ICU** is equal to 4cpu/32GB RAM/150GB NVME SSD node. 

![Spark job instance](/img/guides/spark-job-instance.png)

Hit the `Create` button and that's all. Your job is ready. Job will be run based on the schedule you defined. But, you can also trigger run manually. 

![Spark job View](/img/guides/spark-job-view.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/07e54bd-Screen_Shot_2022-02-13_at_15.34.22.png",
        "Screen Shot 2022-02-13 at 15.34.22.png",
        2166
      ],
      "caption": "Job View"
    }
  ]
}
[/block] -->

You can check the information about historical and current Run. On the Run detail page you can see _when_, _how long_ the job has been run. You can also get the logs of the run: 

![Job Run Logs](/img/guides/job-run-logs.png)
<!-- [block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/ebc6215-Screen_Shot_2022-02-13_at_15.37.38.png",
        "Screen Shot 2022-02-13 at 15.37.38.png",
        2200
      ],
      "caption": "Job Run Logs"
    }
  ]
}
[/block] -->

<br/>

:::info
To submit your custom job. You need to use the the general public spark image provided iomete and build your own docker image based on that. Then the submitting the custom job process is similar. You just need to specify your own customer docker image, application file path and main class name
:::

Congratulations 🎉🎉🎉