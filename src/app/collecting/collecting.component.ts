import { Component, OnInit } from "@angular/core";
import p5 from "p5";
import { poseNet, neuralNetwork } from "ml5";
import { Router } from "@angular/router";

const electron = window.require("electron");

@Component({
  selector: "app-collecting",
  templateUrl: "./collecting.component.html",
  styleUrls: ["./collecting.component.scss"],
})
export class CollectingComponent implements OnInit {
  private p5;
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.createCanvas();
  }

  video: any;
  poseNet: any;
  pose: any;
  skeleton: any;
  brain: any;
  position: any;
  state = "waiting";
  postureLabel: any;
  recording = false;
  startRecording: any;
  stopRecording: any;
  loader: HTMLElement;
  container: HTMLElement;

  // This function is called from inIt() and this function calls the main setup() function
  private createCanvas() {
    this.p5 = new p5(this.setup.bind(this));
  }

  // this function for collect conrdinates and also set posture values
  start(): void {
    this.startRecording.classList.add("disable");
    this.startRecording.disabled = true;
    this.stopRecording.classList.remove("disable");
    this.stopRecording.disabled = false;
    const selectTag: HTMLElement = document.querySelector("#postures");
    this.position = selectTag["value"];
    this.state = "collecting";
  }

  // this function is for stop collecting conrdinates
  stop(): void {
    this.stopRecording.classList.add("disable");
    this.stopRecording.disabled = true;
    this.startRecording.classList.remove("disable");
    this.startRecording.disabled = false;
    this.state = "waiting";
  }

  // This is a main function which create canvas for webcam and it also use the ml5 functions
  setup(p: any): void {
    p.setup = () => {
      this.startRecording = document.getElementById("start");
      this.stopRecording = document.getElementById("stop");

      const canvasCreate = p.createCanvas(500, 300);
      document
        .getElementById("webcam-container")
        .appendChild(canvasCreate.canvas);
      this.video = p.createCapture(p.VIDEO);
      this.video.remove();
      this.video.size(500, 300);
      this.poseNet = poseNet(this.video);
      this.poseNet.on("pose", this.gotPoses.bind(this));

      const options = {
        inputs: 34,
        outputs: 2,
        task: "classification",
      };
      this.brain = neuralNetwork(options);
      p.draw = this.draw.bind(this);
    };
  }

  // This function is to train the json data
  trainModel(): void {
    this.container.style.display = "none";
    this.loader.style.display = "block";
    this.p5.remove();
    this.brain.normalizeData();
    const options = {
      epochs: 50,
    };
    this.brain.train(options, this.finishedTraining.bind(this));
  }

  // This function creates the models files and then navigate to the home page
  finishedTraining(): void {
    alert("please save the files on Downloads/ng-posture-buddy/model");
    this.brain.save();
    const { ipcRenderer } = electron;

    ipcRenderer.once("files-created", () => {
      this.router.navigate(["home"]);
    });
    ipcRenderer.send("creating-models-files");
  }

  // This function is created to push the x,y cordinates of body parts into new inputs array and send it into the brain classify function
  predictPosition(): void {
    if (this.pose) {
      // if the pose varaible is not empty this code will execute
      const inputs = [];
      for (let i = 0; i < this.pose.keypoints.length; i++) {
        const x = this.pose.keypoints[i].position.x;
        const y = this.pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
    } else {
      // if the pose varaible is empty this code will execute and set the timeout of 100 miliseconds and call this function again
      setTimeout(function () {
        this.predictPosition.bind(this);
      }, 100);
    }
  }

  // This function get the cordinates of body and set it into the pose and skeleton varaibles
  gotPoses(poses: Array<any>): void {
    if (poses.length > 0) {
      this.pose = poses[0].pose;
      this.skeleton = poses[0].skeleton;
      if (this.state == "collecting") {
        // if the state is collecting this code will excute to collect the cordinates
        const inputs = [];
        for (let i = 0; i < this.pose.keypoints.length; i++) {
          const x = this.pose.keypoints[i].position.x;
          const y = this.pose.keypoints[i].position.y;
          inputs.push(x);
          inputs.push(y);
        }
        const posture = [this.position];
        this.brain.addData(inputs, posture);
      }
    }
  }

  // This function set the width and height of webcam view, it also process and show the positions with percentage according to the cordinates
  draw(): void {
    this.loader = document.querySelector("app-loader");
    this.container = document.querySelector(".container");
    this.p5.push();
    this.p5.translate(this.video.width, 0);
    this.p5.scale(-1, 1);
    this.p5.image(this.video, 0, 0, this.video.width, this.video.height);

    if (this.pose) {
      for (let i = 0; i < this.skeleton.length; i++) {
        const a = this.skeleton[i][0];
        const b = this.skeleton[i][1];
        this.p5.strokeWeight(2);
        this.p5.stroke(0);

        this.p5.line(a.position.x, a.position.y, b.position.x, b.position.y);
      }
      for (let i = 0; i < this.pose.keypoints.length; i++) {
        const x = this.pose.keypoints[i].position.x;
        const y = this.pose.keypoints[i].position.y;
        this.p5.fill(0);
        this.p5.stroke(255);
        this.p5.ellipse(x, y, 16, 16);
      }
    }
    this.p5.pop();

    this.container.style.display = "flex";
    this.loader.style.display = "none";
  }
}
