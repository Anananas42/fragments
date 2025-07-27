import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FragmentSchema } from '@/lib/schema'
import { ExecutionResult } from '@/lib/types'
import { DeepPartial } from 'ai'
import { ChevronsRight, LoaderCircle, Terminal } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { DeployDialog } from './deploy-dialog'
import { FragmentCode } from './fragment-code'
import { FragmentPreview } from './fragment-preview'

export function Preview({
  teamID,
  accessToken,
  selectedTab,
  onSelectedTabChange,
  isChatLoading,
  isPreviewLoading,
  fragment,
  result,
  onClose,
}: {
  teamID: string | undefined
  accessToken: string | undefined
  selectedTab: 'code' | 'fragment' | 'console'
  onSelectedTabChange: Dispatch<SetStateAction<'code' | 'fragment' | 'console'>>
  isChatLoading: boolean
  isPreviewLoading: boolean
  fragment?: DeepPartial<FragmentSchema>
  result?: ExecutionResult
  onClose: () => void
}) {
  if (!fragment) {
    return null
  }

  const isLinkAvailable = result?.template !== 'code-interpreter-v1'

  return (
    <div className="absolute md:relative z-10 top-0 left-0 shadow-2xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l md:border-y bg-popover h-full w-full overflow-auto">
      <Tabs
        value={selectedTab}
        onValueChange={(value) =>
          onSelectedTabChange(value as 'code' | 'fragment' | 'console')
        }
        className="h-full flex flex-col items-start justify-start"
      >
        <div className="w-full p-2 grid grid-cols-3 items-center border-b">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={onClose}
                >
                  <ChevronsRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex justify-center">
            <TabsList className="px-1 py-0 border h-8">
              <TabsTrigger
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                value="code"
              >
                {isChatLoading && (
                  <LoaderCircle
                    strokeWidth={3}
                    className="h-3 w-3 animate-spin"
                  />
                )}
                Code
              </TabsTrigger>
              <TabsTrigger
                disabled={!result}
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                value="fragment"
              >
                Preview
                {isPreviewLoading && (
                  <LoaderCircle
                    strokeWidth={3}
                    className="h-3 w-3 animate-spin"
                  />
                )}
              </TabsTrigger>
              <TabsTrigger
                disabled={!result || result.template !== 'code-interpreter-v1'}
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center"
                value="console"
              >
                Console
              </TabsTrigger>
            </TabsList>
          </div>
          {result && (
            <div className="flex items-center justify-end gap-2">
              {isLinkAvailable && (
                <DeployDialog
                  url={result.url!}
                  sbxId={result.sbxId!}
                  teamID={teamID}
                  accessToken={accessToken}
                />
              )}
            </div>
          )}
        </div>
        {fragment && (
          <div className="overflow-y-auto w-full h-full">
            <TabsContent value="code" className="h-full">
              {isChatLoading ? (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center text-muted-foreground">
                    <LoaderCircle className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Generating Code</h3>
                    <p className="text-sm">
                      Please wait while the code is being generated...
                    </p>
                  </div>
                </div>
              ) : fragment.code && fragment.file_path ? (
                <FragmentCode
                  files={[
                    {
                      name: fragment.file_path,
                      content: fragment.code,
                    },
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center text-muted-foreground">
                    <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Code Generated</h3>
                    <p className="text-sm">
                      Please try a more specific request.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="fragment" className="h-full">
              {result && <FragmentPreview result={result as ExecutionResult} />}
            </TabsContent>
            <TabsContent value="console" className="h-full">
              {result && result.template === 'code-interpreter-v1' ? (
                <div className="h-full overflow-y-auto p-4">
                  {result.stdout && result.stdout.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">Standard Output</h3>
                      {result.stdout.map((out: string, index: number) => (
                        <pre key={index} className="text-xs mb-1 bg-muted p-2 rounded">
                          {out}
                        </pre>
                      ))}
                    </div>
                  )}
                  {result.stderr && result.stderr.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2 text-red-600">Standard Error</h3>
                      {result.stderr.map((err: string, index: number) => (
                        <pre key={index} className="text-xs mb-1 bg-red-50 dark:bg-red-950 text-red-600 p-2 rounded">
                          {err}
                        </pre>
                      ))}
                    </div>
                  )}
                  {result.runtimeError && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2 text-red-600">Runtime Error</h3>
                      <pre className="text-xs bg-red-50 dark:bg-red-950 text-red-600 p-2 rounded">
                        {result.runtimeError.name}: {result.runtimeError.value}
                        {result.runtimeError.traceback && (
                          <div className="mt-2 text-xs">{result.runtimeError.traceback}</div>
                        )}
                      </pre>
                    </div>
                  )}
                  {(!result.stdout || result.stdout.length === 0) && 
                   (!result.stderr || result.stderr.length === 0) && 
                   !result.runtimeError && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Console Output</h3>
                        <p className="text-sm">
                          The code executed without producing console output.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center text-muted-foreground">
                    <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Console Not Available</h3>
                    <p className="text-sm">
                      Console output is only available for Python code interpreter results.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  )
}
