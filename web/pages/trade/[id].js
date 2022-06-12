import { useRouter } from 'next/router'
import NewTrade from '../components/newTrade'
import TradeDashboard from '../components/tradeDashboard'

export default function Trade() {
    const router = useRouter()
    const { id } = router.query

    if(id === "new") {
        return <NewTrade/>
    } else {
        return <TradeDashboard tradeId={id} />
    }
}