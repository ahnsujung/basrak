import Button from '@/components/ui/Button'

export default function SubmitButton({ dryness, wind, location, loading, onSubmit }) {
  const ready = dryness && wind && location === 'ready'

  return (
    <section className="px-4 pb-4">
      {!ready && (
        <p className="text-xs text-gray-400 text-center mb-2">
          {!location || location !== 'ready'
            ? '위치 확인 후 입력해 주세요'
            : !dryness || !wind
            ? '낙엽 건조도와 풍속을 모두 선택해 주세요'
            : null}
        </p>
      )}
      <Button
        fullWidth
        size="lg"
        disabled={!ready}
        loading={loading}
        onClick={onSubmit}
      >
        {loading ? '등록 중...' : '관측 등록하기'}
      </Button>
    </section>
  )
}
