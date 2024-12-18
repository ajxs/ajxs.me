import express from "express";
import { distFolder } from "./constants";
import { createSite } from "./createSite";

createSite().then(() => {
  const localServerPost = 8998;
  express().use(express.static(distFolder)).listen(localServerPost);
  console.log(`Serving site on http://localhost:${localServerPost}`);
});
