---
title: 'Improving Relative Pose Estimation by Estimating Gravity'
description: 'Using the gravity vector to reduce calibrated relative pose estimation from 5 to 3 degrees of freedom, exponentially cutting the required RANSAC iterations; evaluated on 11,000+ ScanNet image pairs across 260 indoor scenes.'
img: /assets/img/projects/gravity.png
img_alt: Pipeline for relative pose estimation using gravity priors
importance: 30
category: 3D vision
---

_3D Vision, ETH Zürich · March 2022 – May 2022_

Estimating the relative pose of cameras is an important problem in 3D vision applications. It is used to create 3D models from images and for mapping in robotic applications. Especially for real-time applications, it is important to have fast and robust algorithms for relative pose estimation. For calibrated camera settings, without further constraints, the relative pose can be estimated using a 5-point solver. By using the gravity vector of the images, the problem reduces to 3 DoF. This allows us to reduce the sample size and thereby decrease the required amount of RANSAC iterations exponentially. In this work we develop a pipeline to estimate the relative pose using '3-point (with gravity)' and '5-point' estimators, and compare their performance on the ScanNet dataset. We perform tests on more than 11000 image pairs from 260 indoor scenes and varying amounts of error in the gravity estimates.

![Comparison of the 3-point (with gravity) and 5-point estimation pipelines](/assets/img/projects/gravity-2.png)
