package com.github.saasassin.runner.dockermonitor

import org.apache.pekko.actor.{Actor, ActorLogging, ActorSystem, Props}
import scala.sys.process.{Process, ProcessLogger}
import java.io.{BufferedWriter, FileWriter}
import scala.concurrent.duration.DurationInt
import org.apache.pekko.actor.Cancellable
import concurrent.duration.DurationLong
import org.apache.pekko.actor.typed.scaladsl.AbstractBehavior
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.actor.typed.Behavior
import org.apache.pekko.actor.typed.scaladsl.ActorContext
import org.apache.pekko.actor.typed.Signal
import org.apache.pekko.actor.typed.PostStop
import java.io.BufferedOutputStream
import java.io.FileOutputStream
import scala.concurrent.duration.FiniteDuration

object DockerMonitor {
  def apply(
      imageName: String,
      cpuLimit: String,
      memoryLimit: String,
      maxRuntime: FiniteDuration,
      stdoutFile: os.Path,
      stderrFile: os.Path,
      extraArgs: List[os.Shellable] = List.empty[os.Shellable]
  ): Behavior[Command] = Behaviors.setup { context =>
    new DockerMonitor(
      context,
      imageName,
      cpuLimit,
      memoryLimit,
      maxRuntime,
      stdoutFile,
      stderrFile,
      extraArgs
    )
  }
  sealed trait Command
  case object Start extends Command
  case object Stop extends Command
  case object CheckProcess extends Command
  case class Output(line: Array[Byte]) extends Command
  case class Error(line: Array[Byte]) extends Command
}

class DockerMonitor(
    context: ActorContext[DockerMonitor.Command],
    imageName: String,
    cpuLimit: String,
    memoryLimit: String,
    maxRuntime: FiniteDuration,
    stdoutFile: os.Path,
    stderrFile: os.Path,
    extraArgs: List[os.Shellable]
) extends AbstractBehavior[DockerMonitor.Command](context) {
  import DockerMonitor._
  import context.executionContext

  private var process: Option[os.SubProcess] = None
  private val stdoutFileWriter = new BufferedOutputStream(
    new FileOutputStream(stdoutFile.toString, false)
  )
  private val stderrFileWriter = new BufferedOutputStream(
    new FileOutputStream(stderrFile.toString, false)
  )
  private var maxRuntimeTimeout: Option[Cancellable] = None
  private var checkProcessTimeout: Option[Cancellable] = None

  override def onMessage(msg: Command): Behavior[Command] =
    msg match
      case Start =>
        context.log.info(
          s"Starting Docker container: $imageName with CPU: $cpuLimit and Memory: $memoryLimit"
        )
        val args: List[os.Shellable] = List[os.Shellable](
          "docker",
          "run",
          "--rm",
          "--cpus",
          cpuLimit,
          "--memory",
          memoryLimit,
          imageName
        ) ++ extraArgs
        val command = os.proc(args: _*)
        process = Some(
          command
            .spawn(
              stdout = os.ProcessOutput((out: Array[Byte], n: Int) =>
                context.self ! Output(out.slice(0, n))
              ),
              stderr = os.ProcessOutput((err: Array[Byte], n: Int) =>
                context.self ! Error(err.slice(0, n))
              )
            )
        )

        maxRuntimeTimeout = Some(
          context.system.scheduler
            .scheduleOnce(maxRuntime, () => context.self ! Stop)
        )
        checkProcessTimeout = Some(
          context.system.scheduler
            .scheduleOnce(5.second, () => context.self ! CheckProcess)
        )
        this

      case Stop =>
        context.log.info(s"Stopping Docker container: $imageName")
        process.foreach(_.destroy())
        process = None
        stdoutFileWriter.close()
        maxRuntimeTimeout.foreach(_.cancel())
        checkProcessTimeout.foreach(_.cancel())
        Behaviors.stopped

      case Output(bytes) =>
        stdoutFileWriter.write(bytes)
        this

      case Error(bytes) =>
        stderrFileWriter.write(bytes)
        this

      case CheckProcess =>
        process match {
          case Some(p) =>
            if (!p.isAlive()) {
              if (p.exitCode() == 0) {
                context.log.info(s"Process exited with 0")
              } else {
                context.log.error(s"Process exited with ${p.exitCode()}")
              }
              context.self ! Stop
            }
          case None => context.self ! Stop
        }
        this

  override def onSignal: PartialFunction[Signal, Behavior[Command]] =
    case PostStop =>
      process.foreach(_.destroy())
      stdoutFileWriter.close()
      stderrFileWriter.close()
      maxRuntimeTimeout.foreach(_.cancel())
      checkProcessTimeout.foreach(_.cancel())
      this
}
