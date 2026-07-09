---
title: 'Extracting Respiratory Rate with Uncertainty Estimates from Photoplethysmograph Using Probabilistic Deep Neural Networks'
description: 'Probabilistic deep neural networks estimate respiratory rate and its predictive uncertainty from PPG signals, using mean–variance estimation and contrastive pretraining; reliable-window predictions reach ≈3 bpm mean absolute error on the Capnobase and BIDMC datasets.'
img: /assets/img/projects/respr.jpg
img_alt: Teaser figure for respiratory-rate estimation from photoplethysmogram signals
importance: 20
category: uncertainty estimation
---

_Sensing, Interaction & Perception Lab, ETH Zürich · October 2022 – December 2022_

Assessment of predictive uncertainty is of great importance and especially so for medical applications. This study explores the processing of photoplethysmogram (PPG) signals using Probabilistic Deep Neural Networks for estimating the respiratory rate and the associated uncertainty in the prediction. The study is conducted on two publicly available datasets: Capnobase and BIDMC. A residual 1D-Convolutional Neural Network (CNN) with Dropout layers is used in a mean-variance estimation (MVE) setting to get the respiratory rate and uncertainty estimates. We also perform Contrastive Learning for pretraining the network and assessing its effect on uncertainty and predictive performance. We consider predictions with an uncertainty below the threshold of 4 breaths per min (bpm) to be reliable. The model retains 73% windows with reliable estimates and a mean absolute error (MAE) of 3.3 bpm on Capnobase, and 72.3% retained windows with MAE of 2.9 on BIDMC dataset. To evaluate the uncertainty estimates of our trained model, we also analyze the change of the MAE of our model on both datasets. We find that for the BIDMC dataset, the MAE increases as the uncertainty increases, showing the usefulness of our approach. For the Capnobase dataset, we did not find an evident pattern, which may be a result of the smaller size and imbalance in this dataset.
