# GSoC_TrafficApp
## Motivation-
Modern cities can struggle with many issues that impact human well-being. The rise in automobile traffic congestion, for example, has many detrimental effects on human society, including but not limited to increased environmental pollution, fuel consumption, delays, and injuries and deaths due to accidents. Traffic congestion is a complex phenomenon resulting from many factors beyond just the total number of vehicles.

Today, city planners and traffic engineers are turning to machine learning and smart devices to offer novel ways to solve or at least mitigate traffic congestion.

## Project Description-
This Traffic Management System app’s objectives are to enhance transportation processes, lessen traffic congestion and fatalities, offer usersgeneral notifications and alerts, and maintain traffic law enforcement.

### Application Overview

This application has two user interfaces.

- User Interface: This interface allows us, as users, to enter the date and time of our journey in order to obtain the traffic flow at that specific time. This will assist users in planning their trips.

- Admin Interface – Through this interface, the Department of Transportation (DOT) can access the camera installed on the highway and watch the traffic’s live stream.

To better comprehend traffic and gather additional information, they can also download the video and use it for car counting.

### Technical Overview

- Using GRU, we developed a traffic prediction machine learning model.

- HTML, CSS, and Javascript have been used to develop the frontend part of the application, and Flask is used as the backend to integrate the ML model with the app.

- Kubeflow is used to pipeline the process of getting the newer dataset and training model over it.

- Docker is used to containerise the app and deploy the app over kubernetes with the help of Rancher.

## Kaggle Notebook Used for this task is - [Kaggle Notebook](https://www.kaggle.com/datasets/sampanacharya1/traffic-dataset)
- After creating model I saved and used .h5 file of the model to create a Flask app using that .h5 file
- All files related to Flask App had been uploaded on Github repo (GSoC_TrafficApp)<br />
  Flask App can be accessed on local host at this IP- `127.0.0.1:5000`
## Application Containerization
- Then I containerized my Flask App and created its image using DockerFile and deployed it on DockerHub<br /> 
  Cmd to pull the image - `docker pull akshat5302/ml_traffic:4.0`
## Deploying My Flask App on k3s cluster of Rancher
- For this Step I Created 2 Files `deployment.yaml` and `service.yaml`
- And runned them using cmd - `kubectl apply -f deployment.yaml` and `kubectl apply -f service.yaml` on k3s cluster
- Now I'm able to access my app inside KVM using `NodeIP:Nodeport`
- For the next phase I Added ` 172.16.230.162 mcm.rancher.aiic.suse` on /etc/hosts/ file of my local machine 
## Creating Namespace 
- After  logging into `mcm.rancher.aiic.suse` I created a namespace there
- And deployed my yaml files on that namespace.
- After that my Flask App is accessible on - `KVMIP:5000`
