package nxt.http;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import nxt.Account;
import nxt.db.DbIterator;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetRichList extends APIServlet.APIRequestHandler {

	static final GetRichList instance = new GetRichList();

	private GetRichList() {
		super(new APITag[] { APITag.ACCOUNTS });
	}

	@Override
	boolean requirePassword() {
		return true;
	}

	@Override
	JSONStreamAware processRequest(HttpServletRequest req) {

		List<Account> accounts = new ArrayList<Account>();
		try (DbIterator<Account> accs = Account.getAllAccounts(0, Integer.MAX_VALUE)) {
			while (accs.hasNext()) {
				accounts.add(accs.next());
			}
		}

		Comparator<Account> comparator = new Comparator<Account>() {
			public int compare(Account a1, Account a2) {
				if (a2.getBalanceNQT() > a1.getBalanceNQT())
					return 1;
				if (a2.getBalanceNQT() < a1.getBalanceNQT())
					return -1;
				return 0;
			}
		};
		Collections.sort(accounts, comparator);

		JSONObject response = new JSONObject();
		JSONArray accountJSONArray = new JSONArray();
		response.put("accounts", accountJSONArray);
		synchronized (accounts) {// to make sure total balance is consistent
			for (Account account : accounts) {
				JSONObject json = new JSONObject();
				JSONData.putAccount(json, "account", account.getId());
				json.put("accountName",
						(account.getAccountInfo() != null && account.getAccountInfo().getName() != null ? account
								.getAccountInfo().getName() : ""));
				json.put("balanceNQT", String.valueOf(account.getBalanceNQT()));
				json.put("unconfirmedBalanceNQT", String.valueOf(account.getUnconfirmedBalanceNQT()));
				json.put("effectiveBalanceNXT", account.getEffectiveBalanceNXT());
				json.put("forgedBalanceNQT", String.valueOf(account.getForgedBalanceNQT()));
				json.put("guaranteedBalanceNQT", String.valueOf(account.getGuaranteedBalanceNQT()));
				json.put("hasPublicKey", (account.getPublicKey() == null ? "false" : "true"));
				accountJSONArray.add(json);
			}
		}
		return response;
	}

}
