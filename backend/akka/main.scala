package com.github.saasassin.runner

import scala.concurrent.ExecutionContext
import scala.concurrent.Future

import org.apache.pekko
import pekko.actor.typed.ActorSystem
import pekko.actor.typed.Behavior
import pekko.actor.typed.scaladsl.AbstractBehavior
import pekko.actor.typed.scaladsl.ActorContext
import pekko.actor.typed.scaladsl.Behaviors
import pekko.http.scaladsl.server.Route
import pekko.http.scaladsl.Http
import pekko.http.scaladsl.model._
import pekko.http.scaladsl.server.Directives._
import scala.io.StdIn
import org.slf4j.Logger

import concurrent.duration.DurationInt
import scala.jdk.DurationConverters._
import scala.jdk.CollectionConverters._
import dockermonitor.DockerMonitor

object ActorHierarchyMain extends App {
  given system: ActorSystem[_] = ActorSystem(Behaviors.empty, "main")
  given executionContext: ExecutionContext = system.executionContext

  println(
    s"Process ID: ${java.lang.management.ManagementFactory.getRuntimeMXBean.getName}"
  )
  println(s"JVM name: ${System.getProperty("java.vm.name")}")
  println(s"JVM vendor: ${System.getProperty("java.vendor")}")
  println(s"JVM version: ${System.getProperty("java.version")}")

  val route: Route =
    path("hello") {
      get {
        complete(
          HttpEntity(
            ContentTypes.`text/html(UTF-8)`,
            "<h1>Say hello to Pekko HTTP</h1>"
          )
        )
      }
    }

  val host = "localhost"
  val port = 8080
  val url = s"http://$host:$port/hello"

  val bindingFuture = Http().newServerAt(host, port).bind(route)

  val env = System.getenv().asScala

  val monitor =
    system.systemActorOf(
      DockerMonitor(
        imageName = "ubuntu:latest",
        cpuLimit = "1.0",
        memoryLimit = "512m",
        maxRuntime = 60.seconds,
        stdoutFile =
          env.get("BUILD_WORKSPACE_DIRECTORY").map(os.Path(_)).getOrElse(os.pwd)
            / "docker_output.log",
        stderrFile =
          env.get("BUILD_WORKSPACE_DIRECTORY").map(os.Path(_)).getOrElse(os.pwd)
            / "docker_error.log",
      ),
      "docker-monitor"
    )

  monitor ! DockerMonitor.Start

  println(
    s"Server now online. Please navigate to ${url}\nPress RETURN to stop..."
  )
  StdIn.readLine() // let it run until user presses return
  bindingFuture
    .flatMap(_.unbind()) // trigger unbinding from the port
    .onComplete(_ => system.terminate()) // and shutdown when done
}
