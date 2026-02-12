import NewChatInput from "./_components/NewChatInput.client";

export default async function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full min-w-0 px-4 pb-12 overflow-x-hidden">
      <div className="flex flex-col items-center gap-8 w-full max-w-[768px] min-w-0">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            무엇을 도와드릴까요?
          </h1>
          <p className="text-muted-foreground text-base">
            궁금한 점을 물어보세요. 새로운 대화를 시작해 보세요.
          </p>
        </div>
        <NewChatInput />
      </div>
    </div>
  );
}
